import { Router } from "express";
import initJwksClient, { SigningKeyNotFoundError } from "jwks-rsa";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const authRouter = Router();
const jwksClient = initJwksClient({
  jwksUri: process.env.JWKS_URI
});

authRouter.post("/access-token", async (req, res) => {
  if (req.body.accessCode) {
    const response = await fetch(process.env.ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code: req.body.accessCode,
        redirect_uri: process.env.SIGN_IN_REDIRECT_URL
      })
    });

    const json = await response.json();
    if (response.ok) {
      res.status(201).json(json);
    } else {
      res
        .status(response.status)
        .json({ message: json.error_description, auth0Says: json });
    }
  } else {
    res.status(400).json({
      message: "Invalid request for an access token. Please contact support."
    });
  }
});

export async function auth(req, res, next) {
  const authorizationHeader = req.headers["authorization"];
  if (authorizationHeader) {
    const bearerToken = authorizationHeader.replace("Bearer ", "");

    try {
      const decodedToken = jwt.decode(bearerToken, { complete: true });
      const publicKey = (await jwksClient.getSigningKey(
        decodedToken.header.kid
      )).getPublicKey();

      jwt.verify(bearerToken, publicKey);
      res.locals.email = decodedToken.payload.email.toLowerCase();
      next();
    } catch (e) {
      if (
        e instanceof jwt.JsonWebTokenError ||
        e instanceof SigningKeyNotFoundError
      ) {
        res.status(403).json({ message: e.message });
      } else {
        throw e;
      }
    }
  } else {
    res.status(403).json({
      message:
        "Request does not have required Authorization header. Please contact support."
    });
  }
}
