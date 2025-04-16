// src/cli-demo-connect.ts
import { config } from 'dotenv';
import axios from 'axios';
import { apiRequest } from './core/apiRequest';
import { setTokens } from './core/auth/tokenVault';

config(); // Loads .env

const ACCESS_TOKEN = process.env.QUESTRADE_ACCESS_TOKEN;

// This function exchanges a refresh token for an access token + API server
// For Questrade, the value in .env is typically the refresh token
async function exchangeRefreshToken(refreshToken: string): Promise<{
  access_token: string;
  api_server: string;
  refresh_token: string;
  expires_in: number;
}> {
  try {
    console.log('Attempting to exchange refresh token...');

    // Construct the proper form data for token exchange
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    // Make the token exchange request
    const response = await axios.post(
      'https://login.questrade.com/oauth2/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log('Token exchange successful');
    return response.data;
  } catch (err: any) {
    console.error('Failed to exchange refresh token:');
    if (err?.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err);
    }
    throw new Error('Failed to exchange refresh token');
  }
}

// Helper function to discover the API server for a given access token
async function discoverApiServer(accessToken: string): Promise<string> {
  // Questrade's /v1/discover endpoint returns the API server for a given token
  try {
    const response = await axios.get('https://login.questrade.com/oauth2/v1/discover', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // The API server URL is in response.data.api_server
    return response.data.api_server;
  } catch (error: any) {
    console.error('Failed to discover API server:', error?.response?.data || error.message);
    throw new Error('Could not discover API server');
  }
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('QUESTRADE_ACCESS_TOKEN is not set in .env');
    process.exit(1);
  }

  console.log(`Attempting to discover API server for token: ${ACCESS_TOKEN?.substring(0, 5)}...`);

  try {
    // Discover the correct API server for this token
    const apiServer = await discoverApiServer(ACCESS_TOKEN);
    console.log(`Discovered API server: ${apiServer}`);

    // Set the tokens with the discovered API server
    setTokens({
      access_token: ACCESS_TOKEN,
      refresh_token: '',
      expires_at: Date.now() + 3600 * 1000,
      api_server: apiServer,
    });

    // Make the API request
    console.log('Attempting to fetch accounts...');
    const accounts = await apiRequest('/v1/accounts');
    console.log('Connected! Accounts:', JSON.stringify(accounts, null, 2));
  } catch (err: any) {
    console.error('Connection failed:', err);
    if (err?.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    process.exit(2);
  }
}

main();

// Created by luxcium © 2025 (MIT) with Copilot
