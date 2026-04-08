// getProducts.js
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });

const db = DynamoDBDocumentClient.from(client);

export const handler = async () => {
    const data = await db.send(new ScanCommand({
        TableName: "Products"
    }));

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data.Items)
    };
};