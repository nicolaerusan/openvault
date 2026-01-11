/**
 * Example: Domain Checker with OpenVault
 * 
 * This shows how the domain-finder skill from claude-toolkit
 * can be rewritten to use OpenVault for credential management.
 */

import { Vault } from 'openvault';

// Initialize vault
const vault = new Vault();

// Validate that all required Porkbun credentials are present
const validation = vault.validateService('porkbun');
if (!validation.valid) {
  console.error(`Missing credentials: ${validation.missing.join(', ')}`);
  console.error('\nTo set up Porkbun API access:');
  console.error('1. Go to https://porkbun.com/account/api');
  console.error('2. Enable API access for your account');
  console.error('3. Add PORKBUN_API_KEY and PORKBUN_SECRET_KEY to your .env file');
  process.exit(1);
}

// Get credentials for Porkbun
const apiKey = vault.get('PORKBUN_API_KEY');
const secretKey = vault.get('PORKBUN_SECRET_KEY');

interface PorkbunResponse {
  status: string;
  avail?: string;
  price?: string;
  message?: string;
}

async function checkDomain(domain: string): Promise<{
  available: boolean;
  price?: string;
}> {
  const response = await fetch(
    `https://api.porkbun.com/api/json/v3/domain/checkDomain/${domain}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: secretKey,
      }),
    }
  );

  const data: PorkbunResponse = await response.json();

  if (data.status !== 'SUCCESS') {
    throw new Error(data.message || 'API error');
  }

  return {
    available: data.avail === 'yes',
    price: data.price,
  };
}

async function main() {
  const domain = process.argv[2];

  if (!domain) {
    console.error('Usage: npx ts-node domain-checker.ts <domain>');
    console.error('Example: npx ts-node domain-checker.ts example.land');
    process.exit(1);
  }

  try {
    const result = await checkDomain(domain);
    
    if (result.available) {
      console.log(`✅ ${domain} - AVAILABLE ($${result.price}/yr)`);
    } else {
      console.log(`❌ ${domain} - TAKEN`);
    }
  } catch (error) {
    console.error(`⚠️  Error: ${error instanceof Error ? error.message : error}`);
  }
}

main();
