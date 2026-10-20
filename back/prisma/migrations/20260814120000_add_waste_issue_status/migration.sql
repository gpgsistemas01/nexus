INSERT INTO "Status" ("id", "name")
VALUES (gen_random_uuid(), 'Aprobada'), (gen_random_uuid(), 'Cancelada')
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "WasteIssue" ADD COLUMN "statusId" UUID;

UPDATE "WasteIssue"
SET "statusId" = (SELECT "id" FROM "Status" WHERE "name" = 'Aprobada');

ALTER TABLE "WasteIssue" ALTER COLUMN "statusId" SET NOT NULL;

CREATE INDEX "WasteIssue_statusId_idx" ON "WasteIssue"("statusId");

ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_statusId_fkey"
FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
