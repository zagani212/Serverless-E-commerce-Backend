// createProduct.js
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";
import { randomUUID } from "crypto";

export const handler = async (event) => {
    const body = JSON.parse(event.body);

    if (!body.name || !body.price) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Name and price are required" })
        };
    }

    const product = {
        productId: randomUUID(),
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock || 0,
        createdAt: new Date().toISOString()
    };

    await db.send(new PutCommand({
        TableName: "Products",
        Item: product
    }));

    return {
        statusCode: 201,
        body: JSON.stringify(product)
    };
};