import { GetCommand, PutCommand, TransactWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    const order = await db.send(new GetCommand({
        TableName: "Orders",
        Key: { orderId: event.body.orderId }
    }));

    try {
        await db.send(new TransactWriteCommand({
            TransactItems: [
                {
                    Update: {
                        TableName: "Orders",
                        Key: { orderId: order.Item.orderId },
                        UpdateExpression: "SET #status = :status",
                        ExpressionAttributeNames: {
                            "#status": "status"
                        },
                        ExpressionAttributeValues: {
                            ":status": "PAID"
                        }
                    }
                },
                {
                    Update: {
                        TableName: "Payments",
                        Key: { orderId: order.Item.orderId },
                        UpdateExpression: "SET #status = :status",
                        ExpressionAttributeNames: {
                            "#status": "status"
                        },
                        ExpressionAttributeValues: {
                            ":status": "SUCCEEDED"
                        }
                    }
                },
                {
                    Delete: {
                        TableName: "Cart",
                        Key: { userId: order.Item.userId },
                    }
                },
                ...order.Item.products.map(({ productId, quantity }) => ({
                    Update: {
                        TableName: "Products",
                        Key: { productId },
                        UpdateExpression: "SET stock = stock - :qty",
                        ConditionExpression: "attribute_exists(stock) AND stock >= :qty",
                        ExpressionAttributeValues: {
                            ":qty": quantity
                        }
                    }
                }))
            ]
        }))
    } catch (e) {
        console.log(e)
        return { error: "Not enough stock" }
    }

    return { message: "Inventory updated" };
};
