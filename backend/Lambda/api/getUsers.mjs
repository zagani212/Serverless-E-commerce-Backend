import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });

export const handler = async (event) => {
    try {
        const result = await client.send(
            new ScanCommand({
                TableName: "Users"
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify(result.Items || [])
        };
    } catch (error) {
        console.error("Error fetching users:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch users" })
        };
    }
};