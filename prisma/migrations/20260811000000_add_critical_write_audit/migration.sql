CREATE TYPE "CriticalWriteAuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

CREATE TABLE "CriticalWriteAudit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actorId" UUID,
    "action" "CriticalWriteAuditAction" NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100),
    "method" VARCHAR(10) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "changes" JSONB,
    "requestId" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CriticalWriteAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CriticalWriteAudit_actorId_createdAt_idx"
ON "CriticalWriteAudit"("actorId", "createdAt");

CREATE INDEX "CriticalWriteAudit_resource_entityId_createdAt_idx"
ON "CriticalWriteAudit"("resource", "entityId", "createdAt");

CREATE INDEX "CriticalWriteAudit_createdAt_idx"
ON "CriticalWriteAudit"("createdAt");

ALTER TABLE "CriticalWriteAudit"
ADD CONSTRAINT "CriticalWriteAudit_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
