'use server';

import { db } from '@/lib/db';
import { requireAuth, withActionHandler } from '@/lib/action-utils';
import type { ActionResult } from '@/types/actions';
import { ApplicationStatus } from '@prisma/client';
import { publishToChannel, channelNames } from '@/lib/ably';

// ─── Mutations ─────────────────────────────────────────────────────────────────

export async function createApplicationAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const raw = {
      eventPostingId: formData.get('eventPostingId') as string,
      coverLetter: formData.get('coverLetter') as string,
      proposedRate: formData.get('proposedRate')
        ? Number(formData.get('proposedRate'))
        : undefined,
    };

    const { createApplicationSchema } = await import('@/validations/applications');
    const parsed = createApplicationSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      throw Object.assign(new Error('Validation failed'), { fieldErrors });
    }

    // Verify event exists and is open
    const event = await db.eventPosting.findUnique({
      where: { id: parsed.data.eventPostingId },
      select: { id: true, status: true, organizerId: true, applicationDeadline: true },
    });
    if (!event) throw new Error('Event not found');
    if (event.status !== 'open') throw new Error('This event is no longer accepting applications');
    if (event.applicationDeadline < new Date())
      throw new Error('Application deadline has passed');
    if (event.organizerId === auth.session.user.id)
      throw new Error('You cannot apply to your own event');

    // Get artist profile for user
    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: auth.session.user.id },
      select: { id: true },
    });
    if (!artistProfile) throw new Error('You must have an artist profile to apply');

    try {
      const application = await db.application.create({
        data: {
          applicantId: auth.session.user.id,
          artistProfileId: artistProfile.id,
          eventPostingId: parsed.data.eventPostingId,
          coverLetter: parsed.data.coverLetter,
          proposedRate: parsed.data.proposedRate,
        },
      });

      // Create notification for event organizer
      const notification = await db.notification.create({
        data: {
          recipientId: event.organizerId,
          type: 'application_submitted',
          title: 'New Application',
          message: `A new application has been submitted for your event.`,
          relatedEventId: event.id,
          relatedApplicationId: application.id,
        },
      });

      // Publish real-time notification via Ably
      await publishToChannel(
        channelNames.notifications(event.organizerId),
        'new-notification',
        { notification },
      );

      return { id: application.id };
    } catch (err: unknown) {
      // Catch unique constraint violation (duplicate application)
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new Error('You have already applied to this event');
      }
      throw err;
    }
  });
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export async function getApplicationsForEventAction(
  eventId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof db.application.findMany>>>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    // Verify ownership
    const event = await db.eventPosting.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });
    if (!event) throw new Error('Event not found');
    if (event.organizerId !== auth.session.user.id) {
      throw new Error('You can only view applications for your own events');
    }

    return db.application.findMany({
      where: { eventPostingId: eventId },
      include: {
        applicant: { select: { id: true, username: true, email: true, profileImage: true } },
        artistProfile: {
          select: { id: true, stageName: true, profileImage: true, yearsOfExperience: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
}

export async function getMyApplicationsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof db.application.findMany>>>
> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    return db.application.findMany({
      where: { applicantId: auth.session.user.id },
      include: {
        eventPosting: {
          select: {
            id: true,
            title: true,
            location: true,
            eventDate: true,
            status: true,
            organizer: { select: { id: true, username: true } },
          },
        },
        artistProfile: { select: { id: true, stageName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
}

// ─── Status Updates ────────────────────────────────────────────────────────────

export async function updateApplicationStatusAction(
  applicationId: string,
  status: 'accepted' | 'rejected',
): Promise<ActionResult<void>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        eventPosting: { select: { id: true, organizerId: true, title: true } },
      },
    });
    if (!application) throw new Error('Application not found');
    if (application.eventPosting.organizerId !== auth.session.user.id) {
      throw new Error('You can only update applications for your own events');
    }
    if (application.status !== ApplicationStatus.pending) {
      throw new Error('This application has already been processed');
    }

    if (status === 'accepted') {
      // Accept application + add artist to lineup atomically
      await db.$transaction([
        db.application.update({
          where: { id: applicationId },
          data: { status: ApplicationStatus.accepted },
        }),
        db.eventPosting.update({
          where: { id: application.eventPostingId },
          data: {
            lineup: { connect: { id: application.artistProfileId } },
          },
        }),
      ]);
    } else {
      await db.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.rejected },
      });
    }

    // Notify applicant
    const notification = await db.notification.create({
      data: {
        recipientId: application.applicantId,
        type: 'application_status',
        title: `Application ${status}`,
        message: `Your application for "${application.eventPosting.title}" has been ${status}.`,
        relatedEventId: application.eventPostingId,
        relatedApplicationId: applicationId,
      },
    });

    // Publish real-time notification via Ably
    await publishToChannel(
      channelNames.notifications(application.applicantId),
      'new-notification',
      { notification },
    );
  });
}

export async function withdrawApplicationAction(
  applicationId: string,
): Promise<ActionResult<void>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { applicantId: true, status: true },
    });
    if (!application) throw new Error('Application not found');
    if (application.applicantId !== auth.session.user.id) {
      throw new Error('You can only withdraw your own applications');
    }
    if (application.status !== ApplicationStatus.pending) {
      throw new Error('Only pending applications can be withdrawn');
    }

    await db.application.delete({ where: { id: applicationId } });
  });
}
