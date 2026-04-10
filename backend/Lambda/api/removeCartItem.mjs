// removeCartItem.js
import { GetCommand, PutCommand, DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const db = DynamoDBDocumentClient.from(client);

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

    delete cartData.Item.articles[productId]

    console.log(cartData.Item.articles)

    if (Object.keys(cartData.Item.articles).length == 0) {
        await db.send(new DeleteCommand({
            TableName: "Carts",
            Key: { userId }
        }));
        return {
            statusCode: 204,
        };
    }

    const updatedCart = {
        ...cartData.Item,
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