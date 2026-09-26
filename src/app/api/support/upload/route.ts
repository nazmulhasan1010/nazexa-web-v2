import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';
import { getAdminSession } from '@/lib/admin-auth.server';
import crypto from 'crypto';
import { db } from '@/lib/db';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB for support files

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'text/csv',
];

export async function POST(req: NextRequest) {
  try {
    // Both central users and admins can upload support files
    const sessionUser = await getSession();
    const adminSession = sessionUser ? null : await getAdminSession();
    
    if (!sessionUser && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get('file') as File;
    const ticketId = data.get('ticketId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type ${file.type} is not allowed for support attachments.` }, { status: 415 });
    }
    
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be under 20 MB' }, { status: 413 });
    }

    // Verify ticket access if ticketId is provided
    if (ticketId && sessionUser && !adminSession) {
      const ticket = await db.supportTicket.findUnique({
        where: { id: ticketId },
        select: { userId: true }
      });
      if (!ticket || ticket.userId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique storage key
    const uniqueId = crypto.randomUUID();
    // Strip weird characters from original filename for security, but keep extension
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `${uniqueId}-${safeName}`;

    // Store in .data/support-attachments (OUTSIDE public dir)
    const uploadDir = join(process.cwd(), '.data', 'support-attachments');

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Ignore if exists
    }

    const filepath = join(uploadDir, storageKey);
    await writeFile(filepath, buffer);

    // Return attachment metadata (not yet linked to a message)
    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storageKey,
    });
  } catch (error) {
    console.error('Support upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
