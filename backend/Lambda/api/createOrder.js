// createOrder.js
import { PutCommand, GetCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";
import { randomUUID } from "crypto";

export const handler = async (event) => {
    const userId = event.headers["x-user-id"];
    let ERROR = ""

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
                Keys: Object.keys(cart.Item.articles).map(id => ({ productId: id })),
                ProjectionExpression: "productId, price, stock",
            },
        },
    }));

    let totalPrice = 0
    const products = productsPrice.Responses.Products.map((product) => {
        if (product.stock < cart.Item.articles[product.productId]) {
            ERROR = "NOT_ENOUGHT_STOCK"
            return
        }
        let qty = cart.Item.articles[product.productId]
        totalPrice += product.price * qty
        return {
            "productId": product.productId,
            "quantity": qty,
            "priceAtPurchase": product.price
        }
    })

    if (ERROR == "NOT_ENOUGHT_STOCK") {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: `not enought items in stock for some products` })
        }
    }

    const order = {
        orderId: randomUUID(),
        userId: userId,
        products: products,
        totalPrice: totalPrice,
        status: "PENDING",
        createdAt: new Date().toISOString()
    }

    await db.send(new PutCommand({
        TableName: "Orders",
        Item: order
    }))

    return {
        statusCode: 200,
        body: order
    };
};
