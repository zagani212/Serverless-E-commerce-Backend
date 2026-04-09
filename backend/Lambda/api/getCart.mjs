// getCart.js
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const userId = event.headers["x-user-id"];

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing x-user-id header" })
        };
    }

    const data = await db.send(new GetCommand({
        TableName: "Cart",
        Key: { userId }
    }));

    return {
        statusCode: 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "content-type,authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify(data.Item || { userId, items: [] })
    };
};