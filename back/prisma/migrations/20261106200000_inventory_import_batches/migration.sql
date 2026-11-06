CREATE TABLE "InventoryImport" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "version" INTEGER NOT NULL DEFAULT 0,
    "userId" UUID,
    "resource" VARCHAR(16) NOT NULL,
    "mode" VARCHAR(8) NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    "filename" VARCHAR(120) NOT NULL,
    "fileHash" VARCHAR(64) NOT NULL,
    "payload" JSONB,
    "preview" JSONB,
    "result" JSONB,
    "operationId" UUID,
    "commandHash" VARCHAR(64),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "InventoryImport_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryImport_resource_check" CHECK ("resource" IN ('materials', 'consumables', 'wastes')),
    CONSTRAINT "InventoryImport_mode_check" CHECK ("mode" IN ('create', 'update')),
    CONSTRAINT "InventoryImport_status_check" CHECK ("status" IN ('DRAFT', 'COMPLETED', 'CANCELED', 'EXPIRED')),
    CONSTRAINT "InventoryImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "InventoryImport_userId_operationId_key" ON "InventoryImport"("userId", "operationId");
CREATE INDEX "InventoryImport_status_expiresAt_id_idx" ON "InventoryImport"("status", "expiresAt", "id");
CREATE INDEX "InventoryImport_userId_createdAt_idx" ON "InventoryImport"("userId", "createdAt");
CREATE TRIGGER "InventoryImport_increment_version" BEFORE UPDATE ON "InventoryImport"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();
