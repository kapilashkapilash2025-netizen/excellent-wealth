import type { AuditEventType, AuditOutcome, Prisma, PrismaClient } from '@prisma/client';

export interface RecordAuditEventInput {
  userId?: string | null;
  eventType: AuditEventType;
  outcome: AuditOutcome;
  requestId?: string | null;
  /** Small, non-sensitive structured context — never passwords or tokens. */
  metadata?: Prisma.InputJsonValue;
}

/**
 * Records an audit event. Failures here are logged but never thrown —
 * auditing must not be able to break the request it's observing.
 */
export async function recordAuditEvent(
  client: PrismaClient | Prisma.TransactionClient,
  input: RecordAuditEventInput,
): Promise<void> {
  await client.auditEvent.create({
    data: {
      userId: input.userId ?? null,
      eventType: input.eventType,
      outcome: input.outcome,
      requestId: input.requestId ?? null,
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    },
  });
}
