import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';
import { getAdminSession } from '@/lib/admin-auth.server';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

export async function POST(req: NextRequest) {
  try {
    // Allow either a central user session (profile) or an admin session (CMS).
    const sessionUser = await getSession();
    const adminSession = sessionUser ? null : await getAdminSession();
    if (!sessionUser && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be under 8 MB' }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Ignore if exists
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const baseUrl = req.nextUrl.origin || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${filename}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
