// createOrder.js
import { PutCommand, GetCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";
import { randomUUID } from "crypto";

export const handler = async (event) => {
    const userId = event.headers["x-user-id"];

    const cart = await db.send(new GetCommand({
        TableName: "Cart",
        Key: { userId }
    }));

    if (!userId || !cart.Item) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "missing user id or cart doesn't exaist" })
        }
    }

    const productsPrice = await db.send(new BatchGetCommand({
        RequestItems: {
            Products: {
                Keys: cart.Item.map(item => ({ productId: item.productId })),
                ProjectionExpression: "productId, price",
            },
        },
    }));

    const products = productsPrice.Item.map((product) => ({
        "productId": product.productId,
        "quantity": cart.Item.articles[product.productId],
        "priceAtPurchase": product.price
    }))

    const order = {
        orderId: randomUUID(),
        userId: userId,
        products: products,
        totalPrice: productsPrice.Item.reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        status: "PENDING",
        createdAt: new Date().toISOString()
    }

    const command = new PutCommand({
        TableName: "Orders",
        Item: order
    })

    await db.send(command)

    return response = {
        statusCode: 200,
        body: JSON.stringify(command.Item)
    };
};
