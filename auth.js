/**
 * auth.js — Shared authentication utilities
 *
 * Usage: Include this script BEFORE any other JS that makes API calls.
 * It exposes:
 *   - authFetch(url, options)  — drop-in replacement for fetch() that
 *     automatically attaches the access token and handles 401 by
 *     refreshing the token and retrying once.
 *   - requireAuth()            — call once on page load to redirect to
 *     login if no tokens are present at all.
 */

const AUTH_BASE_URL = window.env.BASE_URL;

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function saveTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
    }
}

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_admin');
}

/**
 * requireAuth — call at the top of any protected page.
 * Immediately redirects to login if NEITHER token is present.
 * (A missing access-token alone is fine — authFetch will try to
 *  refresh it.  But if the refresh token is also gone there is
 *  nothing we can do.)
 */
function requireAuth() {
    if (!getAccessToken() && !getRefreshToken()) {
        window.location.replace('index.html');
    }
}

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns the new access token, or null if refresh failed.
 */
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            return data.access_token;
        } else {
            // Refresh token is expired or revoked — force re-login
            clearTokens();
            alert('Your session has expired. Please log in again.');
            window.location.replace('index.html');
            return null;
        }
    } catch (err) {
        console.error('Token refresh failed:', err);
        return null;
    }
}

/**
 * authFetch — drop-in replacement for fetch() with automatic token
 * injection and transparent 401 → refresh → retry logic.
 *
 * Handles three 401 scenarios:
 *  1. "Access token has expired!"  → try refresh then retry
 *  2. "Access token is missing!"   → try refresh (token may have been
 *     cleared while the page was open); if no refresh token → login
 *  3. Any other 401                → session truly invalid → login
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
async function authFetch(url, options = {}) {
    const accessToken = getAccessToken();

    options.headers = {
        ...options.headers,
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
        const data = await response.clone().json().catch(() => ({}));
        const msg = data.message || '';

        // Case 1 & 2: token expired OR missing — attempt a silent refresh
        if (
            data.expired ||
            msg === 'Access token has expired!' ||
            msg === 'Access token is missing!'
        ) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                // Retry original request with the fresh token
                options.headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, options);
            }
            // If refreshAccessToken() returned null it already redirected
        } else {
            // Case 3: truly invalid token — clear and go to login
            clearTokens();
            alert('Your session is invalid. Please log in again.');
            window.location.replace('index.html');
        }
    }

    return response;
}
