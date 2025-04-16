// Created by luxcium with Copilot
// src/cli-auto-token.ts

import { initializeTokens } from './core/auth/tokenManager';
import { apiRequestImproved } from './core/apiRequestImproved';

/**
 * Demonstrate the automatic token management system
 * This script will:
 * 1. Initialize tokens from environment or stored file
 * 2. Make API requests without manual token management
 * 3. Automatically save new tokens for future use
 */
async function main(): Promise<void> {
  try {
    console.log('Initializing token management system...');
    const tokens = await initializeTokens();

    console.log(`Using API server: ${tokens.api_server}`);
    console.log(`Token expires at: ${new Date(tokens.expires_at).toLocaleString()}`);

    // Test connection with Time API endpoint first (lightweight check)
    console.log('\nTesting connection with Time API...');
    const timeResponse = await apiRequestImproved('v1/time');
    console.log('Time API Response:', JSON.stringify(timeResponse, null, 2));

    // Make API request for user info
    console.log('\nFetching user data...');
    const userData = await apiRequestImproved('v1/accounts/me');
    console.log('User ID:', userData.userId);
    console.log('User Name:', userData.name);

    // Fetch account data
    console.log('\nFetching account data...');
    const accountsResponse = await apiRequestImproved('v1/accounts');
    console.log('Accounts:');

    if (accountsResponse.accounts && accountsResponse.accounts.length > 0) {
      accountsResponse.accounts.forEach((account: any, index: number) => {
        console.log(`\nAccount #${index + 1}:`);
        console.log(`  Number: ${account.number}`);
        console.log(`  Type: ${account.type}`);
        console.log(`  Status: ${account.status}`);
        console.log(`  Primary: ${account.isPrimary ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('No accounts found');
    }

    console.log('\nToken has been automatically saved to ~/.questrade-sdk/tokens.json');
    console.log('Future runs will use the stored token - no need to update .env anymore!');

    // Properly exit the process when done
    process.exit(0);
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Execute main function
main().catch(console.error);

// Created by luxcium © 2025 (MIT) with Copilot
