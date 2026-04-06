// processPayment.js
import { GetCommand, PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";
import { randomUUID } from "crypto";

export const handler = async (event) => {
    const order = event
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
        order.status = "PAID"

    } else if (payment.attempts <= 3) {
        payment.status = "PENDING"
        await db.send(new PutCommand({
            TableName: "Payments",
            Item: payment
        }))
        throw new Error("Payment Failed")
    } else {
        payment.status = "FAILED"
        order.status = "FAILED"
    }

    await db.send(new TransactWriteCommand({
        TransactItems: [
            {
                Update: {
                    TableName: "Orders",
                    Key: { orderId: order.orderId },
                    UpdateExpression: "SET #status = :paid",
                    ExpressionAttributeNames: {
                        "#status": "status"
                    },
                    ExpressionAttributeValues: {
                        ":paid": order.status
                    }
                }
            },
            {
                Put: {
                    TableName: "Payments",
                    Item: payment
                }
            },
            ...(payment.status == "SUCCESS" && order.products.map(({ productId, quantity }) => ({
                Update: {
                    TableName: "Products",
                    Key: { productId },
                    UpdateExpression: "SET stock = stock - :qty",
                    ConditionExpression: "stock >= :qty",
                    ExpressionAttributeValues: {
                        ":qty": quantity
                    }
                }
            })))
        ]
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(payment)
    };
};