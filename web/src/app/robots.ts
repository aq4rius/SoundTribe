import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://soundtribe.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/onboarding/', '/chat/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
