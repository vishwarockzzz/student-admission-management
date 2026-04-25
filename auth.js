/**
 * auth.js — Shared authentication utilities
 *
 * Usage: Include this script BEFORE any other JS that makes API calls.
 * It exposes:
 *   - authFetch(url, options) — drop-in replacement for fetch() that
 *     automatically attaches the access token and handles 401 by
 *     refreshing the token and retrying once.
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
            window.location.href = 'index.html';
            return null;
        }
    } catch (err) {
        console.error('Token refresh failed:', err);
        return null;
    }
}

/**
 * authFetch — drop-in replacement for fetch() with automatic token injection
 * and transparent 401 → refresh → retry logic.
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
async function authFetch(url, options = {}) {
    const accessToken = getAccessToken();

    // Merge Authorization header into existing headers
    options.headers = {
        ...options.headers,
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    };

    let response = await fetch(url, options);

    // If 401 — try to refresh once and retry
    if (response.status === 401) {
        const data = await response.clone().json().catch(() => ({}));
        // Only refresh if the error is about expiry (not invalid token)
        if (data.expired || data.message === 'Access token has expired!') {
            const newToken = await refreshAccessToken();
            if (newToken) {
                options.headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, options);
            }
        } else {
            // Token is invalid (not just expired) — redirect to login
            clearTokens();
            alert('Your session is invalid. Please log in again.');
            window.location.href = 'index.html';
        }
    }

    return response;
}
