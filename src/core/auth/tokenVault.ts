// Created by luxcium with Copilot
// src/core/auth/tokenVault.ts

import axios from 'axios';
import type { IAccessTokenResponse } from '../../types/auth/IAccessTokenResponse';
import type { IAuthorizationCodeRequest } from '../../types/auth/IAuthorizationCodeRequest';
import type { IRefreshTokenRequest } from '../../types/auth/IRefreshTokenRequest';
// This module manages Questrade OAuth tokens in-memory for the SDK.
// It provides functions to exchange authorization codes and refresh tokens.

/**
 * Tokens structure for in-memory vault
 */
export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  api_server: string;
}

let TOKENS: Tokens | null = null;

/**
 * Get the current tokens from the vault
 * @throws if tokens are not initialized
 */
export function getTokens(): Tokens {
  if (!TOKENS) throw new Error('Tokens not initialized');
  return TOKENS;
}

/**
 * Exchange an authorization code for tokens
 * @param code - The authorization code
 * @param clientId - The client ID
 * @param redirectUri - The redirect URI
 */
export async function exchangeCode(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<Tokens> {
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  const { data } = await axios.post<IAccessTokenResponse>(
    'https://login.questrade.com/oauth2/token',
    form,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  TOKENS = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    api_server: data.api_server,
  };

  return TOKENS;
}

/**
 * Refresh the access token using the refresh token
 * @param clientId - The client ID
 */
export async function refreshToken(clientId: string): Promise<Tokens> {
  if (!TOKENS?.refresh_token) throw new Error('No refresh token available');

  const form = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: TOKENS.refresh_token,
    client_id: clientId,
  });

  const { data } = await axios.post<IAccessTokenResponse>(
    'https://login.questrade.com/oauth2/token',
    form,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  TOKENS = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    api_server: data.api_server,
  };

  return TOKENS;
}

/**
 * Set the current tokens in the vault (for testing/demo only)
 * @param tokens - Tokens object to set
 * @remarks
 * This function is intended for CLI/demo/testing use only.
 */
export function setTokens(tokens: Tokens): void {
  TOKENS = tokens;
}

// Created by luxcium © 2025 (MIT) with Copilot
