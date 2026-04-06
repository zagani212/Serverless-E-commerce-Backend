// addCartItem.js
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";

export const handler = async (event) => {
    const userId = event.headers["x-user-id"];
    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing x-user-id header" })
        };
    }
    const { productId, quantity } = JSON.parse(event.body);

    await db.send(new UpdateCommand({
        TableName: "Cart",
        Key: { userId },
        UpdateExpression: 'SET articles = if_not_exists(articles, :emptyMap)',
        ExpressionAttributeValues: { ":emptyMap": {} }
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