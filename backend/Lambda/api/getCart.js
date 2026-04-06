// getCart.js
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";

export const handler = async (event) => {
    const userId = event.headers["x-user-id"];

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing x-user-id header" })
        };
    }

    const data = await db.send(new GetCommand({
        TableName: "Cart",
        Key: { userId }
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(data.Item || { userId, items: [] })
    };
};