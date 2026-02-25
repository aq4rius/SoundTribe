'use server';

import { requireAuth } from '@/lib/action-utils';
import { uploadToCloudinary } from '@/lib/cloudinary';
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
