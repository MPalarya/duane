import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5 MB' },
        { status: 400 },
      );
    }

    // Upload to Sanity assets API
    if (!projectId || !token) {
      return NextResponse.json(
        { error: 'Image storage not configured' },
        { status: 500 },
      );
    }

    const buffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `https://${projectId}.api.sanity.io/v2024-01-01/assets/images/${dataset}?filename=${encodeURIComponent(file.name)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          Authorization: `Bearer ${token}`,
        },
        body: buffer,
      },
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error('[Image Upload] Sanity error:', text);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const data = await uploadRes.json();
    const assetId = data.document?._id;
    const url = data.document?.url;

    if (!url) {
      return NextResponse.json({ error: 'Upload failed — no URL returned' }, { status: 500 });
    }

    return NextResponse.json({ url, assetId });
  } catch (err) {
    console.error('[Image Upload Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
