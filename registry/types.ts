/**
 * OpenVault Service Registry Types
 * 
 * TypeScript definitions for the service registry schema
 */

export type CredentialType =
  | 'api_key'
  | 'api_secret'
  | 'api_token'
  | 'bearer_token'
  | 'bot_token'
  | 'app_token'
  | 'personal_access_token'
  | 'access_token'
  | 'access_token_secret'
  | 'access_key_id'
  | 'secret_access_key'
  | 'oauth_client_id'
  | 'oauth_client_secret'
  | 'oauth_refresh_token'
  | 'client_id'
  | 'client_secret'
  | 'signing_secret'
  | 'webhook_secret'
  | 'account_id'
  | 'org_id'
  | 'project_id'
  | 'zone_id'
  | 'region'
  | 'url'
  | 'service_key'
  | 'auth_token'
  | 'phone_number';

export type AuthMethod =
  | 'api_key'
  | 'api_key_pair'
  | 'bearer_token'
  | 'bot_token'
  | 'oauth1'
  | 'oauth2'
  | 'personal_access_token'
  | 'access_key'
  | 'iam_role'
  | 'sso'
  | 'api_token'
  | 'github_app';

export interface Credential {
  /** What this credential is used for */
  description: string;
  
  /** Whether this credential is required for basic usage */
  required: boolean;
  
  /** Type classification for this credential */
  type: CredentialType;
  
  /** Regex pattern for validating credential format */
  pattern?: string;
  
  /** URL where user can create/find this credential */
  setupUrl?: string;
  
  /** Step-by-step instructions to obtain this credential */
  setupSteps?: string[];
  
  /** Default value if not provided (for non-secret config) */
  default?: string;
}

export interface Service {
  /** Human-readable name of the service */
  name: string;
  
  /** Brief description of what the service does */
  description: string;
  
  /** Service homepage URL */
  website?: string;
  
  /** API documentation URL */
  docs?: string;
  
  /** Map of credential key names to their definitions */
  credentials: Record<string, Credential>;
  
  /** Supported authentication methods */
  authMethods?: AuthMethod[];
  
  /** OAuth scopes used by the service */
  scopes?: string[];
  
  /** High-level setup instructions */
  setupSteps?: string[];
}

export interface ServiceRegistry {
  /** JSON Schema reference */
  $schema?: string;
  
  /** Semantic version of the registry */
  version: string;
  
  /** Map of service IDs to service definitions */
  services: Record<string, Service>;
}

// ============================================
// Helper types for SDK usage
// ============================================

/** All registered service IDs */
export type ServiceId = 
  | 'twitter'
  | 'porkbun'
  | 'google_calendar'
  | 'github'
  | 'openai'
  | 'anthropic'
  | 'stripe'
  | 'sendgrid'
  | 'slack'
  | 'aws'
  | 'cloudflare'
  | 'notion'
  | 'discord'
  | 'linear'
  | 'vercel'
  | 'supabase'
  | 'resend'
  | 'twilio';

/** Credential keys for each service */
export type ServiceCredentials = {
  twitter: 'TWITTER_BEARER_TOKEN' | 'TWITTER_API_KEY' | 'TWITTER_API_SECRET' | 'TWITTER_ACCESS_TOKEN' | 'TWITTER_ACCESS_TOKEN_SECRET';
  porkbun: 'PORKBUN_API_KEY' | 'PORKBUN_SECRET_KEY';
  google_calendar: 'GOOGLE_CALENDAR_CLIENT_ID' | 'GOOGLE_CALENDAR_CLIENT_SECRET' | 'GOOGLE_CALENDAR_REFRESH_TOKEN';
  github: 'GITHUB_TOKEN';
  openai: 'OPENAI_API_KEY' | 'OPENAI_ORG_ID';
  anthropic: 'ANTHROPIC_API_KEY';
  stripe: 'STRIPE_SECRET_KEY' | 'STRIPE_PUBLISHABLE_KEY' | 'STRIPE_WEBHOOK_SECRET';
  sendgrid: 'SENDGRID_API_KEY';
  slack: 'SLACK_BOT_TOKEN' | 'SLACK_SIGNING_SECRET' | 'SLACK_APP_TOKEN';
  aws: 'AWS_ACCESS_KEY_ID' | 'AWS_SECRET_ACCESS_KEY' | 'AWS_REGION';
  cloudflare: 'CLOUDFLARE_API_TOKEN' | 'CLOUDFLARE_ACCOUNT_ID' | 'CLOUDFLARE_ZONE_ID';
  notion: 'NOTION_API_KEY';
  discord: 'DISCORD_BOT_TOKEN' | 'DISCORD_CLIENT_ID' | 'DISCORD_CLIENT_SECRET';
  linear: 'LINEAR_API_KEY';
  vercel: 'VERCEL_TOKEN' | 'VERCEL_ORG_ID' | 'VERCEL_PROJECT_ID';
  supabase: 'SUPABASE_URL' | 'SUPABASE_ANON_KEY' | 'SUPABASE_SERVICE_ROLE_KEY';
  resend: 'RESEND_API_KEY';
  twilio: 'TWILIO_ACCOUNT_SID' | 'TWILIO_AUTH_TOKEN' | 'TWILIO_PHONE_NUMBER';
};

/** Get credential keys for a specific service */
export type CredentialKeysFor<S extends ServiceId> = ServiceCredentials[S];

/** All credential keys across all services */
export type AllCredentialKeys = ServiceCredentials[ServiceId];
