import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";


const REGION = process.env.REGION;
const USER_POOL_ID = process.env.USER_POOL_ID;

let pems = null;

// 🔹 Load JWKS and cache it
const getPems = async () => {
    if (pems) return pems;

    const url = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
    const { data } = await axios.get(url);

    pems = {};
    for (const key of data.keys) {
        pems[key.kid] = jwkToPem(key);
    }

    return pems;
};

export const handler = async (event) => {
    try {
        console.log("Headers:", event.headers);
        console.log(event)
        const token = event.headers?.authorization?.split(" ")[1];
        const userIdHeader = event.headers?.["x-user-id"];

        console.log('Here 1')
        console.log(token, userIdHeader)

        if (!token || !userIdHeader) {
            return generatePolicy("Deny", event.routeArn);
        }

        console.log("Here 1.5")
        const decoded = jwt.decode(token, { complete: true });
        console.log("Token decoded")
        console.log(decoded)

        if (!decoded) {
            return generatePolicy("Deny", event.routeArn);
        }

        const pems = await getPems();
        const pem = pems[decoded.header.kid];

        console.log('Here 2')

        if (!pem) {
            return generatePolicy("Deny", event.routeArn);
        }

        // 🔐 Verify token
        const verified = jwt.verify(token, pem, {
            issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`
        });

        console.log("Decoded token:", decoded);
        console.log("Verified token:", verified);

        // 🔥 Your logic: compare sub with x-user-id
        if (verified.sub !== userIdHeader) {
            console.log("comparaison failed")
            return generatePolicy("Deny", event.routeArn);
        }
        console.log('All is good')
        const policy = generatePolicy("Allow", event.routeArn, verified);
        console.log(JSON.stringify(policy))
        return policy

    } catch (error) {
        console.error("Authorization error:", error);
        return generatePolicy("Deny", event.routeArn);
    }
};

const generatePolicy = (effect, resource, user) => {
    return {
        isAuthorized: effect == "Allow",
        context: {
            userId: String(user?.sub),
            username: String(user?.username || user?.preferred_username || "user")
        }
    };
};