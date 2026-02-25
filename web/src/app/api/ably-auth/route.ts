import { NextResponse } from 'next/server';
import Ably from 'ably';
import { auth } from '@/lib/auth';
import { env } from '@/lib/env';

// Never expose ABLY_API_KEY to the browser.
// This endpoint issues short-lived signed token requests.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ablyServer = new Ably.Rest(env.ABLY_API_KEY!);
  const tokenRequest = await ablyServer.auth.createTokenRequest({
    clientId: session.user.id,
    capability: {
      // User can subscribe to their own notification channel
      [`notifications:${session.user.id}`]: ['subscribe'],
      // User can publish/subscribe to any conversation they're part of
      // (conversation-level auth is enforced in server actions)
      'conversation:*': ['publish', 'subscribe', 'presence'],
      'presence:*': ['presence'],
    },
  });

  return NextResponse.json(tokenRequest);
}
