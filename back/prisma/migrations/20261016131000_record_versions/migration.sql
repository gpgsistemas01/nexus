-- Todas las escrituras, incluidas las consultas SQL de stock, invalidan la versión leída.
CREATE FUNCTION nexus_increment_record_version() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW."version" := OLD."version" + 1;
    RETURN NEW;
END;
$$;

ALTER TABLE "Material" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Material_increment_version" BEFORE UPDATE ON "Material"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "SupplierMaterial" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "SupplierMaterial_increment_version" BEFORE UPDATE ON "SupplierMaterial"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "Waste" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Waste_increment_version" BEFORE UPDATE ON "Waste"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "Client" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Client_increment_version" BEFORE UPDATE ON "Client"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "Supplier" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Supplier_increment_version" BEFORE UPDATE ON "Supplier"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "User" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "User_increment_version" BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "Person" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Person_increment_version" BEFORE UPDATE ON "Person"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "Department" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Department_increment_version" BEFORE UPDATE ON "Department"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "Role" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Role_increment_version" BEFORE UPDATE ON "Role"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "Presentation" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "Presentation_increment_version" BEFORE UPDATE ON "Presentation"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "UnitMeasure" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "UnitMeasure_increment_version" BEFORE UPDATE ON "UnitMeasure"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "StockAdjustmentReason" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "StockAdjustmentReason_increment_version" BEFORE UPDATE ON "StockAdjustmentReason"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();

ALTER TABLE "FulfillmentStatus" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER "FulfillmentStatus_increment_version" BEFORE UPDATE ON "FulfillmentStatus"
FOR EACH ROW EXECUTE FUNCTION nexus_increment_record_version();
