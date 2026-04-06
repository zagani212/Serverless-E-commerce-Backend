import { GetCommand, PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";

export const handler = async (event) => {

    const order = await db.send(new GetCommand({
        TableName: "Orders",
        Key: { orderId: event.body.orderId }
    }));


    try {
        await db.send(new TransactWriteCommand({
            TransactItems: [
                order.products.map(({ productId, quantity }) => ({
                    TransactItems: [
                        {
                            Update: {
                                TableName: "Orders",
                                Key: { orderId: order.orderId },
                                UpdateExpression: "SET status = PAID",
                            }
                        },
                        {
                            Update: {
                                TableName: "Payments",
                                Key: { orderId: order.orderId },
                                UpdateExpression: "SET status = SUCCESSED"
                            }
                        },
                        {
                            Update: {
                                TableName: "Products",
                                Key: { productId },
                                UpdateExpression: "SET stock = stock - :qty",
                                ConditionExpression: "stock >= :qty",
                                ExpressionAttributeValues: {
                                    ":qty": quantity
                                }
                            }
                        }]
                }))
            ]
        }))
    } catch (e) {
        return { error: "Not enough stock" }
    }

    return { message: "Inventory updated" };
};
