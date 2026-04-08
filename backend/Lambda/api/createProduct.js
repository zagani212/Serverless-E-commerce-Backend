import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });
const db = DynamoDBDocumentClient.from(client);

import { randomUUID } from "crypto";

const s3 = new S3Client({ region: "eu-west-3" });

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);

        if (!body.name || !body.price) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Name, price and image are required"
                })
            };
        }

        const productId = body.productId ?? randomUUID();

        if (body.image) {
            const imageBuffer = Buffer.from(body.image, "base64");
            const contentType = body.imageType || "image/jpeg";

            await s3.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: productId,
                    Body: imageBuffer,
                    ContentType: contentType
                })
            );
        }

        const imageUrl = `https://${BUCKET_NAME}.s3.eu-west-3.amazonaws.com/${productId}`;

        const product = {
            productId,
            name: body.name,
            description: body.description,
            price: body.price,
            stock: body.stock || 0,
            imageUrl,
            createdAt: new Date().toISOString()
        };

        await db.send(
            new PutCommand({
                TableName: "Products",
                Item: product
            })
        );

        return {
            statusCode: 201,
            body: JSON.stringify(product)
        };
    } catch (error) {
        console.error("Error creating product:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to create product" })
        };
    }
};