// removeCartItem.js
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";

export const handler = async (event) => {
    const userId = event.headers["x-user-id"];
    const { productId } = event.pathParameters;

    const cartData = await db.send(new GetCommand({
        TableName: "Carts",
        Key: { userId }
    }));

    if (!cartData.Item) {
        return { statusCode: 404, body: "Cart not found" };
    }

    const updatedItems = cartData.Item.items.filter(
        item => item.productId !== productId
    );

    const updatedCart = {
        ...cartData.Item,
        items: updatedItems,
        updatedAt: new Date().toISOString()
    };

    await db.send(new PutCommand({
        TableName: "Carts",
        Item: updatedCart
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(updatedCart)
    };
};