ALTER TABLE "Department" ADD COLUMN "key" VARCHAR(100);
ALTER TABLE "Role" ADD COLUMN "key" VARCHAR(100);

UPDATE "Department"
SET "key" = CASE "name"
    WHEN 'DIRECCIÓN' THEN 'management'
    WHEN 'ACABADOS' THEN 'finishing'
    WHEN 'ADMINISTRATIVO' THEN 'administrative'
    WHEN 'ALMACÉN Y PROVEDURÍA' THEN 'warehouse_and_supply'
    WHEN 'DISEÑO' THEN 'design'
    WHEN 'INSTALACIONES' THEN 'installations'
    WHEN 'IMPRESIÓN' THEN 'printing'
    WHEN 'ROUTER' THEN 'router'
    WHEN 'PT/TRÁFICO' THEN 'pt_traffic'
    WHEN 'SISTEMAS' THEN 'systems'
    WHEN 'TALLER 3D' THEN 'workshop_3d'
    WHEN 'VENTAS Y PROYECTOS ESPECIALES' THEN 'sales'
    WHEN 'Almacén' THEN 'warehouse'
    ELSE "id"::text
END;

UPDATE "Role"
SET "key" = CASE "name"
    WHEN 'Administrador del sistema' THEN 'system_admin'
    WHEN 'Coordinador' THEN 'coordinator'
    WHEN 'Auxiliar' THEN 'auxiliary'
    WHEN 'Operador' THEN 'operator'
    WHEN 'Instalador' THEN 'installer'
    WHEN 'Diseñador' THEN 'designer'
    WHEN 'Almacenista' THEN 'warehouse_keeper'
    WHEN 'Repartidor' THEN 'distributor'
    WHEN 'Director' THEN 'director'
    WHEN 'Administrador' THEN 'administrator'
    WHEN 'Contador' THEN 'accountant'
    WHEN 'Asesor de ventas' THEN 'sales_advisor'
    ELSE "id"::text
END;

ALTER TABLE "Department" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "Role" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "Department" ALTER COLUMN "key" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Role" ALTER COLUMN "key" SET DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX "Department_key_key" ON "Department"("key");
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");
