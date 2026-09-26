import { db } from '@/lib/db';
import { encryptSecret, decryptSecret } from './encryption';

/**
 * Type map for config values
 */
export type ConfigValueType = string | number | boolean | Record<string, any> | null;

/**
 * Configuration Service
 */
export class ConfigService {
  
  /**
   * Get a configuration value. Checks DB first, then falls back to process.env.
   */
  static async getConfig<T extends ConfigValueType>(key: string, defaultValue?: T): Promise<T> {
    try {
      const config = await db.systemConfig.findUnique({
        where: { key }
      });

      if (config && config.isEnabled) {
        if (config.isSecret && config.valueEncrypted) {
          return this.parseValue(decryptSecret(config.valueEncrypted), config.valueType) as T;
        } else if (!config.isSecret && config.valuePlain !== null) {
          return this.parseValue(config.valuePlain, config.valueType) as T;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch config ${key} from DB. Falling back to env.`, error);
    }

    // Fallback to process.env
    if (process.env[key] !== undefined) {
      return this.inferAndParseValue(process.env[key]) as T;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    return null as T;
  }

  /**
   * Get a secret configuration specifically.
   */
  static async getSecretConfig(key: string): Promise<string | null> {
    return this.getConfig<string>(key);
  }

  /**
   * Get a public configuration specifically.
   */
  static async getPublicConfig(key: string, defaultValue?: string): Promise<string | null> {
    return this.getConfig<string>(key, defaultValue);
  }

  /**
   * Update or create a configuration value.
   */
  static async updateConfig({
    key,
    category,
    value,
    valueType = 'string',
    isSecret = false,
    isPublic = false,
    description,
    actorId,
    actorName,
  }: {
    key: string;
    category: string;
    value: any;
    valueType?: string;
    isSecret?: boolean;
    isPublic?: boolean;
    description?: string;
    actorId?: string;
    actorName?: string;
  }) {
    let valuePlain: string | null = null;
    let valueEncrypted: string | null = null;

    const stringValue = this.stringifyValue(value, valueType);

    if (isSecret) {
      valueEncrypted = encryptSecret(stringValue);
    } else {
      valuePlain = stringValue;
    }

    // Upsert the config
    const config = await db.systemConfig.upsert({
      where: { key },
      update: {
        category,
        valuePlain,
        valueEncrypted,
        valueType,
        isSecret,
        isPublic,
        description,
        updatedBy: actorId,
      },
      create: {
        key,
        category,
        valuePlain,
        valueEncrypted,
        valueType,
        isSecret,
        isPublic,
        description,
        updatedBy: actorId,
      }
    });

    // Log the change
    await db.systemConfigLog.create({
      data: {
        configKey: key,
        action: 'updated',
        actorId,
        actorName,
        details: JSON.stringify({
          category,
          valueType,
          isSecret,
          // Never log the raw secret!
          value: isSecret ? '*** SECRET UPDATED ***' : valuePlain
        })
      }
    });

    return config;
  }
  
  /**
   * Fetch all configurations for the admin dashboard (secrets are obfuscated).
   */
  static async getAllConfigs() {
    const configs = await db.systemConfig.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });
    
    return configs.map(config => ({
      ...config,
      valuePlain: config.isSecret ? '••••••••••••••••••' : config.valuePlain,
      valueEncrypted: config.isSecret ? '***' : null
    }));
  }

  // --- Helper Methods ---

  private static parseValue(value: string, type: string): any {
    if (value === null || value === undefined) return null;
    
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        try { return JSON.parse(value); } catch { return null; }
      default:
        return value;
    }
  }

  private static stringifyValue(value: any, type: string): string {
    if (value === null || value === undefined) return '';
    
    if (type === 'json' || typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private static inferAndParseValue(value: string | undefined): any {
    if (value === undefined) return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
    return value;
  }
}
