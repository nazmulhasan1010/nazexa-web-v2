import { CONTENT_SCHEMA } from './content-schema';

export const CONTENT_COLLECTIONS = Object.keys(CONTENT_SCHEMA) as (keyof typeof CONTENT_SCHEMA)[];
