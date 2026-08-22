import { PrismaClient } from '@prisma/client';

// This module handles safe creation of events in the outbox table.
// It is designed to be used inside a Prisma transaction alongside the actual update.

export type EventType =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_EMAIL_CHANGED'
  | 'USER_NAME_CHANGED'
  | 'USER_IMAGE_CHANGED'
  | 'USER_EMAIL_VERIFIED'
  | 'USER_STATUS_CHANGED'
  | 'USER_LOGGED_IN'
  | 'PASSWORD_CHANGED';

export function createEventPayload(
  centralUserId: string,
  eventType: EventType,
  payload: Record<string, any>,
  source: string = 'nazexa-web-core'
) {
  return {
    source,
    centralUserId,
    eventType,
    payload: JSON.stringify(payload),
    status: 'pending',
  };
}

/**
 * Helper to record an event using an existing Prisma transaction client.
 * This guarantees that if the event fails to save, the user update rolls back.
 */
export async function emitEvent(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  centralUserId: string,
  eventType: EventType,
  payload: Record<string, any>,
  source: string = 'nazexa-web-core'
) {
  return tx.userEvent.create({
    data: createEventPayload(centralUserId, eventType, payload, source),
  });
}
