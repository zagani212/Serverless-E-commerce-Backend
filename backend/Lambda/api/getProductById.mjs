// getProductById.js
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const { id } = event.pathParameters;

    const data = await db.send(new GetCommand({
        TableName: "Products",
        Key: { productId: id }
    }));

    if (!data.Item) {
        return { statusCode: 404, body: "Product not found" };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(data.Item)
    };
};