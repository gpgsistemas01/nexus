CREATE TABLE "ProfileRoleDepartment" (
    "profileId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,

    CONSTRAINT "ProfileRoleDepartment_pkey" PRIMARY KEY ("profileId", "roleId", "departmentId")
);

-- Preserve every profile/department association for which an existing user
-- access identifies the role assigned in that department.
INSERT INTO "ProfileRoleDepartment" ("profileId", "roleId", "departmentId")
SELECT DISTINCT dp."profileId", urd."roleId", dp."departmentId"
FROM "DepartmentProfile" dp
JOIN "User" u ON u."profileId" = dp."profileId"
JOIN "UserRoleDepartment" urd
  ON urd."userId" = u."id"
 AND urd."departmentId" = dp."departmentId";

-- Associations without a matching user access keep their department and use
-- Operador as the default role.
INSERT INTO "ProfileRoleDepartment" ("profileId", "roleId", "departmentId")
SELECT dp."profileId", operator_role."id", dp."departmentId"
FROM "DepartmentProfile" dp
CROSS JOIN "Role" operator_role
WHERE operator_role."name" = 'Operador'
  AND NOT EXISTS (
      SELECT 1
      FROM "ProfileRoleDepartment" prd
      WHERE prd."profileId" = dp."profileId"
        AND prd."departmentId" = dp."departmentId"
  );

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "DepartmentProfile" dp
        WHERE NOT EXISTS (
            SELECT 1
            FROM "ProfileRoleDepartment" prd
            WHERE prd."profileId" = dp."profileId"
              AND prd."departmentId" = dp."departmentId"
        )
    ) THEN
        RAISE EXCEPTION 'No se puede migrar DepartmentProfile: el rol Operador no está disponible';
    END IF;
END $$;

ALTER TABLE "ProfileRoleDepartment"
    ADD CONSTRAINT "ProfileRoleDepartment_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProfileRoleDepartment"
    ADD CONSTRAINT "ProfileRoleDepartment_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProfileRoleDepartment"
    ADD CONSTRAINT "ProfileRoleDepartment_departmentId_fkey"
    FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TABLE "DepartmentProfile";
