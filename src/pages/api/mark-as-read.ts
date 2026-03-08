import type { APIRoute } from 'astro';
import { getToken } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

const CACHE_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
};

// This function is refactored from the original `actions.ts`
async function removeItemFromCookie(cookies: APIRoute['cookies'], folderId: string, itemId: string) {
    const cookieName = `localRandomItemIds:${encodeURIComponent(folderId)}`;
    const currentIds: Array<string | number> = JSON.parse(cookies.get(cookieName)?.value || '[]');
    const targetId = String(itemId);
    const newIds = currentIds
        .map((id) => String(id))
        .filter((id) => id !== targetId);
    cookies.set(cookieName, JSON.stringify(newIds), CACHE_COOKIE_OPTIONS);
}

async function addRecentlyReadItem(cookies: APIRoute['cookies'], itemId: string) {
    const cookieName = 'recentlyReadItemIds';
    const currentIds: Array<string | number> = JSON.parse(cookies.get(cookieName)?.value || '[]');
    const newIds = [String(itemId), ...currentIds.map((id) => String(id))]
        .filter((id, index, self) => self.indexOf(id) === index) // Unique
        .slice(0, 42); // Keep parity with legacy behavior
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

        const response = await apiFetch('/reader/api/0/edit-tag', {
            token,
            method: 'POST',
            queryParams: {
                i: itemId,
                a: 'user/-/state/com.google/read',
            },
        });

        if (response !== 'OK') {
            throw new Error(`Failed to mark item as read: unexpected response '${response}'`);
        }

        // Update cookies
        if (folderId) {
            await removeItemFromCookie(cookies, folderId, itemId);
        }
        await addRecentlyReadItem(cookies, itemId);
        
        return new Response('OK', { status: 200 });

    } catch (error) {
        console.error('Mark as read API error:', error);
        const message = error instanceof Error ? error.message : 'An internal server error occurred.';
        return new Response(message, { status: 500 });
    }
};
