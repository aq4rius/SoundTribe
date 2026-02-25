import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SoundTribe — Discover, Connect & Create Music';
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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0533 50%, #0a2a3a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo text */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #d946ef, #22d3ee, #34d399)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 24,
          }}
        >
          SoundTribe
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 700,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Discover, Connect &amp; Create Music
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 16,
          }}
        >
          Find gigs · Discover artists · Build your music career
        </div>
      </div>
    ),
    { ...size },
  );
}
