UPDATE "WasteIssue" AS waste_issue
SET "statusId" = canceled_status."id"
FROM "FulfillmentStatus" AS fulfillment_status,
     "Status" AS canceled_status
WHERE waste_issue."fulfillmentStatusId" = fulfillment_status."id"
  AND fulfillment_status."name" = 'Cancelado'
  AND canceled_status."name" = 'Cancelada'
  AND waste_issue."statusId" <> canceled_status."id";
