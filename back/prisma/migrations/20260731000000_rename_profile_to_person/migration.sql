-- Keep the persisted domain language aligned with the Personas module without
-- recreating records: PostgreSQL renames preserve UUIDs and every relationship.
ALTER TABLE "Profile" RENAME TO "Person";
ALTER TABLE "ProfileRoleDepartment" RENAME TO "PersonRoleDepartment";

ALTER TABLE "User" RENAME COLUMN "profileId" TO "personId";
ALTER TABLE "PersonRoleDepartment" RENAME COLUMN "profileId" TO "personId";

ALTER TABLE "Person" RENAME CONSTRAINT "Profile_pkey" TO "Person_pkey";
ALTER TABLE "PersonRoleDepartment"
    RENAME CONSTRAINT "ProfileRoleDepartment_pkey" TO "PersonRoleDepartment_pkey";
ALTER TABLE "User"
    RENAME CONSTRAINT "User_profileId_fkey" TO "User_personId_fkey";
ALTER TABLE "PersonRoleDepartment"
    RENAME CONSTRAINT "ProfileRoleDepartment_profileId_fkey" TO "PersonRoleDepartment_personId_fkey";
ALTER TABLE "PersonRoleDepartment"
    RENAME CONSTRAINT "ProfileRoleDepartment_roleId_fkey" TO "PersonRoleDepartment_roleId_fkey";
ALTER TABLE "PersonRoleDepartment"
    RENAME CONSTRAINT "ProfileRoleDepartment_departmentId_fkey" TO "PersonRoleDepartment_departmentId_fkey";
