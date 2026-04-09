import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    try {
        const { userName, request } = event;

        const attributes = request.userAttributes;
        const userId = attributes.sub;

        const item = {
            userId: userId,
            username: userName,
            email: attributes.email,
            createdAt: new Date().toISOString(),
            isAdmin: false
        };

        console.log(item);

        await client.send(
            new PutCommand({
                TableName: "Users",
                Item: item
            })
        );

        console.log("User saved:", item);

        return event;
    } catch (error) {
        console.error("Error saving user:", error);
        throw error;
    }
};