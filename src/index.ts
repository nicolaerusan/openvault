/**
 * OpenVault SDK
 * 
 * Standardized auth and credentials for reusable AI skills
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  getCredential, 
  getRequiredCredentials, 
  validateCredential, 
  findServiceByCredential,
  getSetupInstructions,
  type ServiceId 
} from '../registry/index.js';

export interface VaultOptions {
  /** Path to .env file (default: looks in cwd and parent directories) */
  envPath?: string;
  /** Whether to throw on missing credentials (default: true) */
  throwOnMissing?: boolean;
  /** Whether to validate credential formats (default: true) */
  validate?: boolean;
}

export class Vault {
  private credentials: Map<string, string> = new Map();
  private options: Required<VaultOptions>;

  constructor(options: VaultOptions = {}) {
    this.options = {
      envPath: options.envPath ?? this.findEnvFile(),
      throwOnMissing: options.throwOnMissing ?? true,
      validate: options.validate ?? true,
    };
    
    this.loadEnv();
    this.loadFromEnv();
  }

  /**
   * Get a credential by key
   */
  get(key: string): string {
    // First try our loaded credentials
    let value = this.credentials.get(key);
    
    // Fall back to process.env
    if (!value) {
      value = process.env[key];
    }
    
    if (!value && this.options.throwOnMissing) {
      const serviceId = findServiceByCredential(key);
      if (serviceId) {
        const instructions = getSetupInstructions(serviceId, key);
        let message = `Credential not found: ${key}`;
        if (instructions.url) {
          message += `\n\nGet it here: ${instructions.url}`;
        }
        if (instructions.steps) {
          message += `\n\nSetup steps:\n${instructions.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}`;
        }
        throw new Error(message);
      }
      throw new Error(`Credential not found: ${key}`);
    }
    
    // Validate format if enabled
    if (value && this.options.validate) {
      const serviceId = findServiceByCredential(key);
      if (serviceId) {
        const result = validateCredential(serviceId, key, value);
        if (!result.valid) {
          console.warn(`Warning: ${result.error}`);
        }
      }
    }
    
    return value ?? '';
  }

  /**
   * Get a credential for a specific service (with validation)
   */
  getFor<S extends ServiceId>(serviceId: S, key: string): string {
    const credential = getCredential(serviceId, key);
    if (!credential) {
      throw new Error(`Unknown credential ${key} for service ${serviceId}`);
    }
    
    return this.get(key);
  }

  /**
   * Check if a credential exists
   */
  has(key: string): boolean {
    return this.credentials.has(key) || key in process.env;
  }

  /**
   * Get all credentials for a service
   */
  getServiceCredentials(serviceId: ServiceId): Record<string, string> {
    const requiredKeys = getRequiredCredentials(serviceId);
    const result: Record<string, string> = {};
    
    for (const key of requiredKeys) {
      result[key] = this.get(key);
    }
    
    return result;
  }

  /**
   * Validate all required credentials for a service are present
   */
  validateService(serviceId: ServiceId): { valid: boolean; missing: string[] } {
    const requiredKeys = getRequiredCredentials(serviceId);
    const missing = requiredKeys.filter(key => !this.has(key));
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Set a credential (in memory only, does not persist)
   */
  set(key: string, value: string): void {
    this.credentials.set(key, value);
  }

  /**
   * Find .env file by walking up directory tree
   */
  private findEnvFile(): string {
    let dir = process.cwd();
    
    while (true) {
      const envPath = path.join(dir, '.env');
      if (fs.existsSync(envPath)) {
        return envPath;
      }
      
      const parent = path.dirname(dir);
      if (parent === dir) {
        // Reached root, return default
        return path.join(process.cwd(), '.env');
      }
      dir = parent;
    }
  }

  /**
   * Load credentials from .env file
   */
  private loadEnv(): void {
    const envPath = this.options.envPath;
    
    if (!fs.existsSync(envPath)) {
      return;
    }
    
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      // Parse KEY=value
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      this.credentials.set(key, value);
    }
  }

  /**
   * Load any relevant credentials from process.env
   */
  private loadFromEnv(): void {
    // This allows process.env to be checked as fallback in get()
    // No need to copy everything into our map
  }
}

/**
 * Create a vault instance with default options
 */
export function createVault(options?: VaultOptions): Vault {
  return new Vault(options);
}

// Default export for simple usage
export default Vault;

// Re-export registry utilities
export { 
  getService, 
  getCredential, 
  getRequiredCredentials, 
  validateCredential,
  findServiceByCredential,
  listServices,
  listAllCredentialKeys 
} from '../registry/index.js';

export type { ServiceId, Service, Credential, CredentialType, AuthMethod } from '../registry/types.js';
