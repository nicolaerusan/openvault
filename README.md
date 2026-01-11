# OpenVault

**Standardized auth and credentials for reusable AI skills (Claude Code, Codex, Cursor etc)**

> **Work in Progress**: This project is currently at the idea stage. We're working toward an initial MVP and are open to feedback!

## Introduction & Motivation

In the world of AI skills—whether you're building for Claude Code, Codex, Cursor, or other services—there's a common challenge developers face. Each skill often needs API tokens or credentials, and right now there's no standard way to handle that. Everyone stores and names their tokens differently, and many folks aren't familiar with best practices for authentication.

That's why we're building OpenVault. Our goal is to provide a simple, standardized way to manage credentials. Initially, everything is stored locally in plain `.env` files right alongside your skills. But as you grow, the SDKs—available in multiple languages like JavaScript/TypeScript and Python—can fall back to these local files or switch to a shared vault if defined. This means you can start simple and then plug in database-backed or hosted vault services later on.

Ultimately, we want to make your skills more portable, reusable, and take the guesswork out of managing credentials.

## Features

- **Multi-language SDKs**: SDKs for JavaScript/TypeScript and Python (more coming), making it easy to integrate in your language of choice
- **Simple CLI Tool**: Command-line interface to add, check, and manage credentials effortlessly
- **Flexible Storage**: Start with a `.env` file or switch to a shared vault as your needs grow
- **Local-first**: Everything starts as plain text files on your local file system—easy to inspect and understand
- **Adapters**: Future support for database-backed services or hosted vault services (HashiCorp Vault, AWS Secrets Manager, etc.)

## Getting Started

### Installation

Install the OpenVault tool via npm or Homebrew:

```bash
npx install-openvault
```

or

```bash
brew install openvault
```

### Using a .env File

Create a `.env` file in your project directory with standard credential keys:

```
TWITTER_TOKEN=your_twitter_token
GOOGLE_CALENDAR_SECRET=your_calendar_secret
PORTMAN_API_KEY=your_portman_key
```

The OpenVault SDK will automatically read these credentials.

### Switching to a Shared Vault

Configure the SDK to use a central vault by setting a vault URL or path in the configuration. The SDKs will prioritize the shared vault when defined, falling back to local `.env` files if needed.

## CLI Usage

```bash
# Add a credential
openvault add TWITTER_TOKEN your_twitter_token

# Check a credential
openvault check TWITTER_TOKEN

# List all credentials
openvault list

# Validate your .env file against standard credential names
openvault validate
```

## SDK Usage

### JavaScript/TypeScript

```javascript
const vault = require('openvault');

// Load credentials (local or from shared vault)
const twitterToken = vault.get('TWITTER_TOKEN');
```

### Python

```python
from openvault import Vault

vault = Vault()
twitter_token = vault.get('TWITTER_TOKEN')
```

## How It Works

1. **Local .env files**: By default, the SDK reads from `.env` files in your skill's directory
2. **Shared vault**: If a shared vault is configured, the SDK prioritizes it over local files
3. **Fallback**: If a credential isn't in the shared vault, it falls back to local `.env` files
4. **Validation**: Use the CLI to validate that your credential names match the standard library of credential names

## Service Registry

OpenVault maintains a registry of common services with standardized credential names. This ensures that:

1. **Skills are portable**: If two skills both need Twitter, they use the same `TWITTER_BEARER_TOKEN` key
2. **Validation is possible**: The CLI can validate that your credential names match the standard
3. **Setup is guided**: Each credential has documentation on how to obtain it

### Registered Services

| Service | Credentials |
|---------|-------------|
| Twitter/X | `TWITTER_BEARER_TOKEN`, `TWITTER_API_KEY`, `TWITTER_API_SECRET` |
| Porkbun | `PORKBUN_API_KEY`, `PORKBUN_SECRET_KEY` |
| Google Calendar | `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REFRESH_TOKEN` |
| GitHub | `GITHUB_TOKEN` |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_ORG_ID` |
| Anthropic | `ANTHROPIC_API_KEY` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Slack | `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET` |
| AWS | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` |
| Cloudflare | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| Notion | `NOTION_API_KEY` |
| Discord | `DISCORD_BOT_TOKEN` |
| Linear | `LINEAR_API_KEY` |
| Vercel | `VERCEL_TOKEN` |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Resend | `RESEND_API_KEY` |
| Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |

See the full registry at [`registry/services.json`](./registry/services.json).

## Migrating Existing Skills

### Before (manual credential handling)

```typescript
// Old way - custom credential loading logic in every skill
function getBearerToken(): string {
  if (process.env.TWITTER_BEARER_TOKEN) {
    return process.env.TWITTER_BEARER_TOKEN;
  }
  
  const configPath = path.join(__dirname, '.config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.bearer_token) {
      return config.bearer_token;
    }
  }
  
  throw new Error('TWITTER_BEARER_TOKEN not found');
}
```

### After (with OpenVault)

```typescript
import { Vault } from 'openvault';

const vault = new Vault();

// Simple one-liner with built-in validation
const bearerToken = vault.get('TWITTER_BEARER_TOKEN');

// Or with explicit service validation
const bearerToken = vault.getFor('twitter', 'TWITTER_BEARER_TOKEN');
```

### Bash Scripts

```bash
# Before - manual env loading
source "$PROJECT_ROOT/.env"
curl -X POST "https://api.porkbun.com/..." \
  -d "{\"apikey\": \"$PORKBUN_API_KEY\", ...}"

# After - with OpenVault CLI
API_KEY=$(openvault get PORKBUN_API_KEY)
SECRET=$(openvault get PORKBUN_SECRET_KEY)
curl -X POST "https://api.porkbun.com/..." \
  -d "{\"apikey\": \"$API_KEY\", \"secretapikey\": \"$SECRET\"}"
```

## Roadmap

- [x] Service registry with standard credential names
- [ ] Core JavaScript/TypeScript SDK
- [ ] Core Python SDK
- [ ] CLI tool for credential management
- [ ] Validation utility for standard credential names
- [ ] Shared vault configuration
- [ ] Adapters for hosted vault services

## Contributing

We're at the idea stage and would love your feedback! Feel free to open issues or PRs with suggestions.

## License

MIT
