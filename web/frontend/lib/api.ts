'use client';

/**
 * Enhanced fetch wrapper that automatically handles 401 Unauthorized errors
 * by attempting to rotate the access token using the refresh token.
 */
async function attemptTokenRotation() {
    try {
        const res = await fetch('/api/auth/refresh-token', {
            method: 'POST',
            headers: { Accept: 'application/json' },
        });
        return res.ok;
    } catch (err) {
        return false;
    }
}

export async function fetchApi(url: string, options: RequestInit = {}) {
    let res = await fetch(url, options);

    // If we get a 401, it likely means the access token expired.
    // We attempt rotation if we're not already trying to auth/refresh or login.
    if (
        res.status === 401 &&
        !url.includes('/auth/refresh-token') &&
        !url.includes('/auth/login')
    ) {
        const success = await attemptTokenRotation();
        if (success) {
            // If rotation worked (cookies are updated), retry the original request once.
            res = await fetch(url, options);
        }
    }

    return res;
}
