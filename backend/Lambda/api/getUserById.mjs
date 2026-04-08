import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });

export const handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const result = await client.send(
            new GetCommand({
                TableName: "Users",
                Key: { userId: id }
            })
        );
        return {
            statusCode: 200,
            body: JSON.stringify(result.Item)
        };
    } catch (error) {
        console.error("Error fetching user:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch user" })
        };
    }
};