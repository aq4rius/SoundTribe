'use server';

import { db } from '@/lib/db';
import { requireAuth, withActionHandler } from '@/lib/action-utils';
import type { ActionResult } from '@/types/actions';
import type { Prisma, EventStatus, PaymentType } from '@prisma/client';

// ─── Filters ───────────────────────────────────────────────────────────────────

export interface EventFilters {
  search?: string;
  genres?: string[];
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMin?: string;
  paymentMax?: string;
  paymentType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ─── Public Queries ────────────────────────────────────────────────────────────

export async function getEventsAction(filters: EventFilters = {}) {
  return withActionHandler(async () => {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 9;
    const skip = (page - 1) * limit;

    const where: Prisma.EventPostingWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.genres && filters.genres.length > 0) {
      where.genres = { some: { id: { in: filters.genres } } };
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.eventDate = {};
      if (filters.dateFrom) where.eventDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.eventDate.lte = new Date(filters.dateTo);
    }

    if (filters.paymentMin || filters.paymentMax) {
      where.paymentAmount = {};
      if (filters.paymentMin) where.paymentAmount.gte = parseFloat(filters.paymentMin);
      if (filters.paymentMax) where.paymentAmount.lte = parseFloat(filters.paymentMax);
    }

    if (filters.paymentType) {
      where.paymentType = filters.paymentType as PaymentType;
    }

    if (filters.status) {
      where.status = filters.status as EventStatus;
    }

    const [events, total] = await Promise.all([
      db.eventPosting.findMany({
        where,
        include: {
          genres: { select: { id: true, name: true } },
          organizer: { select: { id: true, username: true, email: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
      }),
      db.eventPosting.count({ where }),
    ]);

    return { data: events, totalPages: Math.ceil(total / limit), total };
  });
}

export async function getEventByIdAction(id: string) {
  return withActionHandler(async () => {
    const event = await db.eventPosting.findUnique({
      where: { id },
      include: {
        genres: { select: { id: true, name: true } },
        organizer: { select: { id: true, username: true, email: true, profileImage: true } },
        lineup: { select: { id: true, stageName: true, profileImage: true } },
        applications: {
          include: {
            applicant: { select: { id: true, username: true } },
            artistProfile: { select: { id: true, stageName: true, profileImage: true } },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!event) throw new Error('Event not found');
    return event;
  });
}

// ─── Authenticated Queries ─────────────────────────────────────────────────────

export async function getMyEventsAction() {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    return db.eventPosting.findMany({
      where: { organizerId: auth.session.user.id },
      include: {
        genres: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export async function createEventAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const raw = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      genres: formData.getAll('genres') as string[],
      requiredInstruments: (formData.get('requiredInstruments') as string)
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      location: formData.get('location') as string,
      eventDate: formData.get('eventDate') as string,
      duration: formData.get('duration') as string,
      paymentAmount: formData.get('paymentAmount') as string,
      paymentType: formData.get('paymentType') as string,
      requiredExperience: formData.get('requiredExperience') as string,
      applicationDeadline: formData.get('applicationDeadline') as string,
    };

    // Validate
    const { createEventSchema } = await import('@/validations/events');
    const parsed = createEventSchema.safeParse({
      ...raw,
      eventDate: new Date(raw.eventDate),
      duration: Number(raw.duration),
      paymentAmount: Number(raw.paymentAmount),
      requiredExperience: Number(raw.requiredExperience),
      applicationDeadline: new Date(raw.applicationDeadline),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      throw Object.assign(new Error('Validation failed'), { fieldErrors });
    }

    // Validate deadline < eventDate
    if (parsed.data.applicationDeadline >= parsed.data.eventDate) {
      throw Object.assign(new Error('Application deadline must be before the event date'), {
        fieldErrors: {
          applicationDeadline: ['Application deadline must be before the event date'],
        },
      });
    }

    const event = await db.eventPosting.create({
      data: {
        organizerId: auth.session.user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        requiredInstruments: parsed.data.requiredInstruments,
        location: parsed.data.location,
        eventDate: parsed.data.eventDate,
        duration: parsed.data.duration,
        paymentAmount: parsed.data.paymentAmount,
        paymentType: parsed.data.paymentType as PaymentType,
        requiredExperience: parsed.data.requiredExperience,
        applicationDeadline: parsed.data.applicationDeadline,
        genres: {
          connect: parsed.data.genres.map((id) => ({ id })),
        },
      },
    });

    return { id: event.id };
  });
}

export async function updateEventAction(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    // Verify ownership
    const existing = await db.eventPosting.findUnique({
      where: { id },
      select: { organizerId: true },
    });
    if (!existing) throw new Error('Event not found');
    if (existing.organizerId !== auth.session.user.id) {
      throw new Error('You can only edit your own events');
    }

    const raw = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      genres: formData.getAll('genres') as string[],
      requiredInstruments: (formData.get('requiredInstruments') as string)
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      location: formData.get('location') as string,
      eventDate: formData.get('eventDate') as string,
      duration: formData.get('duration') as string,
      paymentAmount: formData.get('paymentAmount') as string,
      paymentType: formData.get('paymentType') as string,
      requiredExperience: formData.get('requiredExperience') as string,
      applicationDeadline: formData.get('applicationDeadline') as string,
    };

    const { updateEventSchema } = await import('@/validations/events');
    const parsed = updateEventSchema.safeParse({
      ...raw,
      eventDate: raw.eventDate ? new Date(raw.eventDate) : undefined,
      duration: raw.duration ? Number(raw.duration) : undefined,
      paymentAmount: raw.paymentAmount ? Number(raw.paymentAmount) : undefined,
      requiredExperience: raw.requiredExperience ? Number(raw.requiredExperience) : undefined,
      applicationDeadline: raw.applicationDeadline ? new Date(raw.applicationDeadline) : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      throw Object.assign(new Error('Validation failed'), { fieldErrors });
    }

    const data: Prisma.EventPostingUpdateInput = {};
    if (parsed.data.title) data.title = parsed.data.title;
    if (parsed.data.description) data.description = parsed.data.description;
    if (parsed.data.requiredInstruments)
      data.requiredInstruments = parsed.data.requiredInstruments;
    if (parsed.data.location) data.location = parsed.data.location;
    if (parsed.data.eventDate) data.eventDate = parsed.data.eventDate;
    if (parsed.data.duration) data.duration = parsed.data.duration;
    if (parsed.data.paymentAmount !== undefined)
      data.paymentAmount = parsed.data.paymentAmount;
    if (parsed.data.paymentType) data.paymentType = parsed.data.paymentType as PaymentType;
    if (parsed.data.requiredExperience !== undefined)
      data.requiredExperience = parsed.data.requiredExperience;
    if (parsed.data.applicationDeadline)
      data.applicationDeadline = parsed.data.applicationDeadline;

    if (parsed.data.genres) {
      data.genres = { set: parsed.data.genres.map((gid) => ({ id: gid })) };
    }

    await db.eventPosting.update({ where: { id }, data });

    return { id };
  });
}

export async function deleteEventAction(id: string): Promise<ActionResult<void>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const existing = await db.eventPosting.findUnique({
      where: { id },
      select: { organizerId: true },
    });
    if (!existing) throw new Error('Event not found');
    if (existing.organizerId !== auth.session.user.id) {
      throw new Error('You can only delete your own events');
    }

    await db.eventPosting.delete({ where: { id } });
  });
}
