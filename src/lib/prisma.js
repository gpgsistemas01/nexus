import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "./databaseUrl.js";

const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
});

export const prisma = new PrismaClient({ adapter });
