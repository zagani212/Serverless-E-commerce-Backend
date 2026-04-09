// processPayment.js
import { GetCommand, PutCommand, TransactWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const db = DynamoDBDocumentClient.from(client);
import { randomUUID } from "crypto";

export const handler = async (event) => {
    const order = event.body
    const payment = {
        "paymentId": "",
        "orderId": order.orderId,
        "status": "INITIATED",
        "attempts": 1,
        "updatedAt": new Date().toISOString()
    }

    const data = await db.send(new GetCommand({
        TableName: "Payments",
        Key: { orderId: order.orderId }
    }));
    if (data.Item) {
        payment.paymentId = data.Item.paymentId
        payment.attempts = data.Item.attempts + 1;
    } else {
        payment.paymentId = randomUUID();
    }
    if (Math.random() < process.env.SUCCESS_PROBABILITTY) {
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
        body: payment
    };
};