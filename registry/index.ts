/**
 * OpenVault Service Registry
 * 
 * Provides access to the service registry for validation and lookup
 */

import servicesData from './services.json';
import type { ServiceRegistry, Service, Credential, ServiceId, CredentialKeysFor } from './types';

// Cast the JSON data to our typed interface
export const registry: ServiceRegistry = servicesData as ServiceRegistry;

/**
 * Get a service definition by ID
 */
export function getService(serviceId: ServiceId): Service | undefined {
  return registry.services[serviceId];
}

/**
 * Get all credential definitions for a service
 */
export function getCredentials(serviceId: ServiceId): Record<string, Credential> | undefined {
  return registry.services[serviceId]?.credentials;
}

/**
 * Get a specific credential definition
 */
export function getCredential(serviceId: ServiceId, credentialKey: string): Credential | undefined {
  return registry.services[serviceId]?.credentials[credentialKey];
}

/**
 * Get all required credential keys for a service
 */
export function getRequiredCredentials(serviceId: ServiceId): string[] {
  const service = registry.services[serviceId];
  if (!service) return [];
  
  return Object.entries(service.credentials)
    .filter(([_, cred]) => cred.required)
    .map(([key, _]) => key);
}

/**
 * Validate a credential value against its pattern (if defined)
 */
export function validateCredential(
  serviceId: ServiceId, 
  credentialKey: string, 
  value: string
): { valid: boolean; error?: string } {
  const credential = getCredential(serviceId, credentialKey);
  
  if (!credential) {
    return { valid: false, error: `Unknown credential: ${credentialKey} for service: ${serviceId}` };
  }
  
  if (!credential.pattern) {
    return { valid: true };
  }
  
  const regex = new RegExp(credential.pattern);
  if (!regex.test(value)) {
    return { 
      valid: false, 
      error: `Invalid format for ${credentialKey}. Expected pattern: ${credential.pattern}` 
    };
  }
  
  return { valid: true };
}

/**
 * Get setup instructions for a credential
 */
export function getSetupInstructions(serviceId: ServiceId, credentialKey: string): {
  url?: string;
  steps?: string[];
} {
  const credential = getCredential(serviceId, credentialKey);
  return {
    url: credential?.setupUrl,
    steps: credential?.setupSteps
  };
}

/**
 * Find which service a credential key belongs to
 */
export function findServiceByCredential(credentialKey: string): ServiceId | undefined {
  for (const [serviceId, service] of Object.entries(registry.services)) {
    if (credentialKey in service.credentials) {
      return serviceId as ServiceId;
    }
  }
  return undefined;
}

/**
 * List all registered services
 */
export function listServices(): { id: ServiceId; name: string; description: string }[] {
  return Object.entries(registry.services).map(([id, service]) => ({
    id: id as ServiceId,
    name: service.name,
    description: service.description
  }));
}

/**
 * List all credential keys across all services
 */
export function listAllCredentialKeys(): string[] {
  const keys: string[] = [];
  for (const service of Object.values(registry.services)) {
    keys.push(...Object.keys(service.credentials));
  }
  return keys;
}

// Re-export types
export * from './types';
