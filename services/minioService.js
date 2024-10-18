import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configure the AWS SDK to use MinIO
const s3Client = new S3Client({
  region: "us-east-1", // specify your region
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  endpoint: "http://localhost:9000",
  forcePathStyle: true, // for MinIO compatibility
});

// Function to upload a file
export const uploadCodeSnippet = async (fileContent, fileName) => {
  const params = {
    Bucket: "codesnippets",
    Key: fileName,
    Body: fileContent,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    console.log(`File uploaded successfully at ${data.Location}`);
    return data;
  } catch (s3Err) {
    console.log("Sorryyyyy....");
    console.error(s3Err);
    throw s3Err;
  }
};
