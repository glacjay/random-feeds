import type { APIRoute } from 'astro';
import { getToken } from '@/lib/auth';

const CACHE_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
};

async function removeItemFromCookie(cookies: APIRoute['cookies'], folderId: string, itemId: string) {
    const cookieName = `localRandomItemIds:${encodeURIComponent(folderId)}`;
    const currentIds: Array<string | number> = JSON.parse(cookies.get(cookieName)?.value || '[]');
    const targetId = String(itemId);
    const newIds = currentIds
        .map((id) => String(id))
        .filter((id) => id !== targetId);
    cookies.set(cookieName, JSON.stringify(newIds), CACHE_COOKIE_OPTIONS);
}

export const POST: APIRoute = async ({ request, cookies }) => {
    const token = getToken(cookies);
    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const payload = await request.json();
        const itemId = String(payload.itemId || '');
        const folderId = payload.folderId ? String(payload.folderId) : undefined;
        if (!itemId) {
            return new Response('itemId is required', { status: 400 });
        }

        // Remove from local folder cache cookie only when folder context exists
        if (folderId) {
            await removeItemFromCookie(cookies, folderId, itemId);
        }
        
        return new Response('OK', { status: 200 });

    } catch (error) {
        console.error('Remove item API error:', error);
        const message = error instanceof Error ? error.message : 'An internal server error occurred.';
        return new Response(message, { status: 500 });
    }
};
