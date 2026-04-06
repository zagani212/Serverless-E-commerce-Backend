// getOrders.js
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";

export const handler = async () => {
    const data = await db.send(new ScanCommand({
        TableName: "Orders"
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    };
};