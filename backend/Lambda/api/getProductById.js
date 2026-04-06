// getProductById.js
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";

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