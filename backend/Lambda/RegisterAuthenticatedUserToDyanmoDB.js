import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });

export const handler = async (event) => {
    try {
        const { userName, request } = event;

        const attributes = request.userAttributes;
        console.log(attributes)
        const userId = attributes.sub;

        const item = {
            userId: { S: userId },
            username: { S: userName },
            email: { S: attributes.email },
            createdAt: { S: new Date().toISOString() },
            isAdmin: false
        };

        await client.send(
            new PutItemCommand({
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