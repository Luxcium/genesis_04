// Created by luxcium with Copilot
// /projects/templates/genesis_04/src/cli-exchange-token.ts
// This script demonstrates how to exchange a Questrade refresh token for access token and API server
// Created by luxcium © 2025 (MIT) with Copilot

import { config } from 'dotenv';
import axios from 'axios';
import { setTokens } from './core/auth/tokenVault';
import { apiRequest } from './core/apiRequest';
import type { Tokens } from './core/auth/tokenVault';

config(); // Load environment variables from .env file

// Get the refresh token from .env
// For Questrade, the value in QUESTRADE_ACCESS_TOKEN is actually a refresh token
const REFRESH_TOKEN = process.env.QUESTRADE_ACCESS_TOKEN;

/**
 * Exchange a refresh token for access token and API server
 * @param refreshToken - The Questrade refresh token
 * @returns Tokens object with access_token, refresh_token, expires_at and api_server
 */
async function exchangeRefreshToken(refreshToken: string): Promise<Tokens> {
  try {
    console.log('Exchanging refresh token for access token...');

    // Create form data for token exchange
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    // Make the token exchange request
    const response = await axios.post(
      'https://login.questrade.com/oauth2/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // Convert API response to our Tokens format
    const tokens: Tokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: Date.now() + (response.data.expires_in * 1000),
      api_server: response.data.api_server,
    };

    return tokens;
  } catch (error: any) {
    console.error('Failed to exchange refresh token:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

/**
 * Main function to demonstrate token exchange and API call
 */
async function main(): Promise<void> {
  if (!REFRESH_TOKEN) {
    console.error('Error: QUESTRADE_ACCESS_TOKEN not set in .env file');
    process.exit(1);
  }

  try {
    console.log(`Using refresh token: ${REFRESH_TOKEN.substring(0, 5)}...`);

    // Step 1: Exchange refresh token for access token and API server
    const tokens = await exchangeRefreshToken(REFRESH_TOKEN);

    console.log('Exchange successful!');
    console.log(`Access token: ${tokens.access_token.substring(0, 10)}...`);
    console.log(`API server: ${tokens.api_server}`);

    // Step 2: Store tokens in the token vault
    setTokens(tokens);

    // Step 3: Make an API request to test the token
    console.log('\nTesting API connection by fetching accounts...');
    // Correct endpoint format for Questrade API
    const accounts = await apiRequest('v1/accounts');
    console.log('Success! Accounts:', JSON.stringify(accounts, null, 2));

    // Important: Save the new refresh token for future use
    console.log('\nIMPORTANT: New refresh token received. Update your .env file with:');
    console.log(`QUESTRADE_ACCESS_TOKEN=${tokens.refresh_token}`);

  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Execute main function
main().catch(console.error);
