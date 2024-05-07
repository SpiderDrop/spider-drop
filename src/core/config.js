import { Router } from "express";

export const configRouter = Router();

configRouter.use(["/", "/my-spiders"], (_, res) => {
  res.status(200).json({
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    SIGN_IN_REDIRECT_URL: process.env.SIGN_IN_REDIRECT_URL,
    AUTHORIZATION_URL: process.env.AUTHORIZATION_URL,
    USER_INFO_URL: process.env.USER_INFO_URL,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE
  });
});
