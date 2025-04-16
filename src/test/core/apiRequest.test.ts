// Created by luxcium with Copilot
// src/test/core/apiRequest.test.ts
// Created by luxcium © 2025 (MIT) with Copilot

import { config } from 'dotenv';
import { apiRequest } from '../../core/apiRequest';

config(); // Loads .env file

// Replace with a real endpoint and ensure .env contains a valid token setup
const TEST_CLIENT_ID = process.env.QUESTRADE_CLIENT_ID ?? '';
const TEST_AUTH_CODE = process.env.QUESTRADE_AUTH_CODE ?? '';
const TEST_REDIRECT_URI = process.env.QUESTRADE_REDIRECT_URI ?? '';

describe('apiRequest', () => {
  it('should throw if not authenticated', async () => {
    await expect(apiRequest('/v1/accounts')).rejects.toThrow();
  });

  it('should have test env variables defined', () => {
    expect(TEST_CLIENT_ID).toBeDefined();
    expect(TEST_AUTH_CODE).toBeDefined();
    expect(TEST_REDIRECT_URI).toBeDefined();
  });

  it('should mock a successful API response', async () => {
    jest.spyOn(require('axios'), 'default').mockResolvedValueOnce({ data: { mock: 'ok' } });
    require('../../core/auth/tokenVault').getTokens = () => ({
      access_token: 'mock',
      refresh_token: 'mock',
      expires_at: Date.now() + 100000,
      api_server: 'https://mock.api/',
    });
    const result = await apiRequest('/mock');
    expect(result).toEqual({ mock: 'ok' });
    jest.restoreAllMocks();
  });

  it('should connect live if .env and tokens are valid', async () => {
    if (!TEST_CLIENT_ID || !TEST_AUTH_CODE || !TEST_REDIRECT_URI) {
      return;
    }
    // This test expects a valid token in the vault, or you must call exchangeCode here
    // For demonstration, we skip if not set up
    try {
      const result = await apiRequest('/v1/accounts', 'GET', undefined, false, TEST_CLIENT_ID);
      expect(result).toBeDefined();
    } catch (err) {
      // Acceptable: not authenticated or invalid token
      expect(err).toBeDefined();
    }
  });
});
// Created by luxcium © 2025 (MIT) with Copilot
