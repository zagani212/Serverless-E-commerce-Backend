// addCartItem.js
import { UpdateCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const userId = event.headers["x-user-id"];
    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing x-user-id header" })
        };
    }
    const { productId, quantity } = JSON.parse(event.body);

    const product = await db.send(new GetCommand({
        TableName: "Products",
        Key: { productId }
    }));

    if (!product.Item || product.Item.stock <= 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Product not found or sold out" })
        }
    }

    await db.send(new UpdateCommand({
        TableName: "Cart",
        Key: { userId },
        UpdateExpression: 'SET articles = if_not_exists(articles, :emptyMap), expires_at = :expireTime',
        ExpressionAttributeValues: { ":emptyMap": {}, ":expireTime": Math.floor(Date.now() / 1000) + (60 * 60) }
    }));

    const result = await db.send(
        new UpdateCommand({
            TableName: "Cart",
            Key: { userId },
            UpdateExpression: `
        SET articles.#id = if_not_exists(articles.#id, :zero) + :qty
      `,
            ExpressionAttributeNames: {
                "#id": productId,
            },
            ExpressionAttributeValues: {
                ":zero": 0,
                ":qty": parseInt(quantity)
            },
            ReturnValues: "ALL_NEW",
        })
    );

    return {
        statusCode: 200,
        body: JSON.stringify(result.Attributes)
    };
};