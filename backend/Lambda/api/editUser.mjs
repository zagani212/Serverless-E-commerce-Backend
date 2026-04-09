import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    try {
        const { isAdmin } = JSON.parse(event.body)
        console.log(event.pathParameters)
        console.log(event)
        const { id } = event.pathParameters
        const result = await client.send(
            new UpdateCommand({
                TableName: "Users",
                Key: {
                    userId: id
                },
                UpdateExpression: "SET isAdmin = :isAdmin",
                ConditionExpression: "attribute_exists(userId)",
                ExpressionAttributeValues: {
                    ":isAdmin": isAdmin
                },
                ReturnValues: "ALL_NEW"
            })
        );

        return result.Attributes;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};