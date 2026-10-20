ALTER TABLE "WasteMovement"
ADD COLUMN "observations" VARCHAR(500),
ADD COLUMN "createdById" UUID;

CREATE INDEX "WasteMovement_createdById_idx" ON "WasteMovement"("createdById");

ALTER TABLE "WasteMovement"
ADD CONSTRAINT "WasteMovement_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
