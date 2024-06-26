import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";
import { getSignedUrl as s3GetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodeHttpHandler } from '@smithy/node-http-handler';
import https  from 'https';
import { config } from "dotenv";
config();

const agent = new https.Agent({
     maxSockets: 5000
});


const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  requestHandler: new NodeHttpHandler({
    requestTimeout: 3_000,
    httpsAgent: agent
})
});

export const putObject = async (body, key) => {
  const params = {
    Body: body,
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };
  const command = new PutObjectCommand(params);
  const response = await s3Client.send(command);
  return response;
};

export const getObject = async key => {
  const params = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME
  };
  const command = new GetObjectCommand(params);
  const response = await s3Client.send(command);
  return response;
};

export const listObjects = async (numbObjects, prefix) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: prefix,
    Delimeter: '/',
    MaxKeys: numbObjects
  };
  const command = new ListObjectsV2Command(params);
  const response = await s3Client.send(command);
  return response;
};

export const deleteObject = async key => {
  const params = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME
  };
  const command = new DeleteObjectCommand(params);
  const response = await s3Client.send(command);
  return response;
};

export const getSignedDownloadUrl = async (key, expiresIn) => {
  const params = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME,
  };
  const command = new GetObjectCommand(params);
  return s3GetSignedUrl(s3Client, command, { expiresIn });
};

export const getSignedUploadUrl = async (key, expiresIn) => {
  const params = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME,
  };
  const command = new PutObjectCommand(params);
  return s3GetSignedUrl(s3Client, command, { expiresIn });
};
