// getProducts.js
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.js";

export const handler = async () => {
    const data = await db.send(new ScanCommand({
        TableName: "Products"
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    };
};