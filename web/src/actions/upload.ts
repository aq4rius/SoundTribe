'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/action-utils';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import type { ActionResult } from '@/types/actions';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function uploadAttachmentAction(
  formData: FormData,
): Promise<ActionResult<{ url: string; type: string; name: string }>> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { success: false, error: authResult.error };
  }

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided' };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'File type not allowed' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { success: false, error: 'File too large (max 10MB)' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToCloudinary(buffer, 'chat-attachments');

  return { success: true, data: { url, type: file.type, name: file.name } };
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { success: false, error: authResult.error };
  }
  const { session } = authResult;

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided' };

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
  if (!ALLOWED.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG and WebP images are allowed' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Image must be smaller than 5MB' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToCloudinary(buffer, 'avatars');

  await db.user.update({
    where: { id: session.user.id },
    data: { profileImage: url },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/edit-profile');

  return { success: true, data: { url } };
}
