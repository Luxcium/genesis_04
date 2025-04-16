// Created by luxcium with Copilot
// src/core/apiRequestImproved.ts

import axios, { AxiosRequestConfig } from 'axios';
import { getTokens } from './auth/tokenVault';
import { ensureValidToken } from './auth/tokenManager';
import { throttle } from './rateLimiter/leakyBucketLimiter';

/**
 * Make an authenticated API request to Questrade with automatic token management
 * @param endpoint - API endpoint (e.g. 'v1/accounts')
 * @param method - HTTP method
 * @param body - Request body (for POST)
 * @param retry - Whether to retry once on 401
 */
export async function apiRequestImproved<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  retry = true
): Promise<T> {
  await throttle();

  // Ensure token is valid and refreshed if needed - this handles token refresh automatically
  await ensureValidToken();
  const { access_token, api_server } = getTokens();

  const config: AxiosRequestConfig = {
    method,
    url: `${api_server}${endpoint}`,
    headers: { Authorization: `Bearer ${access_token}` },
    data: body ?? undefined,
  };

  try {
    const res = await axios(config);
    return res.data;
  } catch (err: any) {
    // Handle Questrade error response
    if (err?.response) {
      const { status, data } = err.response;

      // Retry once on 401 Unauthorized (token expired)
      if (retry && status === 401) {
        // Force token refresh and retry the request
        await ensureValidToken();
        return apiRequestImproved(endpoint, method, body, false);
      }

      // Questrade error format: { code, message }
      throw new Error(`Questrade API error ${status}: ${data?.message || data?.code || 'Unknown error'}`);
    }
    throw err;
  }
}

// Created by luxcium © 2025 (MIT) with Copilot
