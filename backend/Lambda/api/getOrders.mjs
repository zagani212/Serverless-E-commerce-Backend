// getOrders.js
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const db = DynamoDBDocumentClient.from(client);

export const handler = async () => {
    const data = await db.send(new ScanCommand({
        TableName: "Orders"
    }));
    return {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    };
};