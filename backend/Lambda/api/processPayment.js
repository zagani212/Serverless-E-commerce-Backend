// processPayment.js
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";
import { randomUUID } from "crypto";

export const handler = async (event) => {
    const { orderId } = event
    const payment = {
        "paymentId": "",
        "orderId": orderId,
        "status": "INITIATED",
        "attempts": 1,
        "updatedAt": new Date().toISOString()
    }
    const data = await db.send(new GetCommand({
        TableName: "Payments",
        Key: { orderId }
    }));

    if (data.Item) {
        payment.paymentId = data.Item.paymentId
        payment.attempts = data.Item.attempts + 1;
    } else {
        payment.paymentId = randomUUID();
    }

    if (Math.random() < 0.2) {
        payment.status = "SUCCESS"
    } else if (payment.attempts <= 3) {
        payment.status = "PENDING"
        await db.send(new PutCommand({
            TableName: "Payments",
            Item: payment
        }))
        throw new Error("Payment Failed")
    } else {
        payment.status = "FAILED"
    }

    await db.send(new PutCommand({
        TableName: "Payments",
        Item: payment
    }))

    return {
        statusCode: 200,
        body: JSON.stringify(payment)
    };
};