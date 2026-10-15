import { PrismaClient } from "../../generated/prisma/client.ts";
import { QueuedPrismaPg } from "./queuedPrismaPg.js";
import { getDatabaseUrl } from "./databaseUrl.js";

const adapter = new QueuedPrismaPg({
    connectionString: getDatabaseUrl(),
});

export const prisma = new PrismaClient({ adapter });
