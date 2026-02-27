import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { _type, slug } = body;

    // Revalidate based on content type
    switch (_type) {
      case 'blogPost':
        revalidatePath('/[locale]/blog', 'page');
        if (slug?.current) {
          revalidatePath(`/[locale]/blog/${slug.current}`, 'page');
        }
        break;
      case 'medicalPage':
        revalidatePath('/[locale]/about', 'page');
        break;
      case 'communityLink':
        revalidatePath('/[locale]/community', 'page');
        break;
      case 'spotlightPerson':
        revalidatePath('/[locale]/community/spotlight', 'page');
        break;
      case 'resource':
        revalidatePath('/[locale]/community', 'page');
        break;
      default:
        // Revalidate everything for unknown types
        revalidatePath('/', 'layout');
    }

    return NextResponse.json({ revalidated: true, type: _type });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
