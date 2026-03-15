import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Duane Syndrome - Global Information & Community Portal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #faf5f0 0%, #f0e6d8 50%, #e8ddd0 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#1a1a1a',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Duane Syndrome
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: '#6b5b4f',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Global Information & Community Portal
          </div>
          <div
            style={{
              marginTop: '20px',
              fontSize: '18px',
              fontWeight: 500,
              color: '#8b7b6f',
              textAlign: 'center',
              maxWidth: '700px',
            }}
          >
            Medical information, specialist directory, community support, and interactive tools
          </div>
          <div
            style={{
              marginTop: '24px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#a08b7a',
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
            }}
          >
            duane-syndrome.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
