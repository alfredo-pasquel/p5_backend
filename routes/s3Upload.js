const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { fromEnv } = require('@aws-sdk/credential-providers');

// Console logs to verify environment variables
// console.log("AWS Access Key:", process.env.AWS_ACCESS_KEY_ID);
// console.log("AWS Secret Access Key:", process.env.AWS_SECRET_ACCESS_KEY);
// console.log("AWS Region:", process.env.AWS_REGION);

// Initialize S3 client
const s3 = new S3Client({
  credentials: fromEnv(),
  region: process.env.AWS_REGION
});

// Route to generate pre-signed URL
router.get('/generate-upload-url', async (req, res) => {
    try {
      const { fileName, fileType, albumId } = req.query;
  
      // Validate required parameters
      if (!fileName || !fileType || !albumId) {
        return res.status(400).json({ error: 'Missing required query parameters' });
      }
  
      // Trim values to remove any extraneous whitespace or line breaks
      const sanitizedFileName = fileName.trim();
      const sanitizedAlbumId = albumId.trim();
  
      // Construct unique S3 key
      const key = `${sanitizedAlbumId}_${Date.now()}_${sanitizedFileName}`;
  
      const params = {
        Bucket: 'ap-p5-vinyl-bucket', // Replace with your bucket name if different
        Key: key,
        ContentType: fileType
      };
      
      const command = new PutObjectCommand(params);
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      
      // Construct image URL to store in the database
      const imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  
      console.log("Generated upload URL:", uploadUrl); // Log the generated URL
      res.status(200).json({ uploadUrl, imageUrl });
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });
  

module.exports = router;
