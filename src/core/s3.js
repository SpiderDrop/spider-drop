import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const putObject = async (body, key) => {
  const params = {
    Body: body,
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  const command = new PutObjectCommand(params);
  const response = await s3Client.send(command);
  return response;
};

export const getObject = async (key) => {
  const params = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME,
  };
  const command = new GetObjectCommand(params);
  const response = await s3Client.send(command);
  return response;
};

export const listObjects = async (numbObjects) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    MaxKeys: numbObjects,
  };
  const command = new ListObjectsV2Command(params);
  const response = await s3Client.send(command);
  return response;
};

export const deleteObject = async (key) => {
  const params = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME,
  };
  const command = new DeleteObjectCommand(params);
  const response = await s3Client.send(command);
  return response;
};
