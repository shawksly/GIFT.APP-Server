const aws = require("aws-sdk");
const crypto = require('crypto')

const region = "us-east-2"
const bucketName = "gift.app-bucket"
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY= process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4"
});

async function uploadURL(){
  const rawBytes = await crypto.randomBytes(16);
  const imgName = rawBytes.toString("hex");
  
  const params = {
    Bucket: bucketName,
    Key: imgName,
    Expires: 15,
  }

  return await s3.getSignedUrlPromise("putObject",params)
}

module.exports = uploadURL ;