CREATE TABLE "WasteOperation" (
    "userId" UUID NOT NULL,
    "operationId" UUID NOT NULL,
    "requestHash" VARCHAR(64) NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WasteOperation_pkey" PRIMARY KEY ("userId", "operationId"),
    CONSTRAINT "WasteOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
