// imageToModel.js (No stream version)
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const MESHY_API_KEY = process.env.MESHY_TEST_API_KEY;
const MESHY_API_URL = process.env.MESHY_API_URL;
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 10000,
    socketTimeout: 20000,
  }),
  maxAttempts: 1,
});

const uploadToS3 = async (buffer, filename, contentType) => {
  const command = new PutObjectCommand({
    Bucket: "kokomatto-3d-models",
    Key: `models/${filename}`,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read",
  });

  try {
    console.log("I am in try block of uploadToS3");
    await s3.send(command);
    console.log("Uploading to S3:", filename);
    const publicUrl = `https://kokomatto-3d-models.s3.amazonaws.com/models/${filename}`;
    console.log(`Uploaded to S3: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error("S3 v3 upload error:", err);
    throw err;
  }
};

async function pollTaskStatus(taskId) {
  const headers = {
    Authorization: `Bearer ${MESHY_API_KEY}`,
  };

  while (true) {
    const res = await axios.get(`${MESHY_API_URL}/${taskId}`, { headers });
    const task = res.data;

    if (task.status === "SUCCEEDED") {
      return task;
    }
    console.log(
      `Task ${taskId} status: ${task.status} | Progress: ${task.progress}`
    );
    await sleep(5000);
  }
}

// POST /api/imagetomodel
const imageToModel = async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: "No image_url provided" });
    }

    const previewPayload = {
      mode: "preview",
      image_url: image_url,
      enable_pbr: true,
      should_remesh: true,
      should_texture: true,
    };

    const previewRes = await axios.post(MESHY_API_URL, previewPayload, {
      headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
    });

    const previewTaskId = previewRes.data.result;
    const previewTask = await pollTaskStatus(previewTaskId);
    const previewModelUrl = previewTask.model_urls?.glb;

    const refinePayload = {
      mode: "refine",
      image_url: image_url,
      preview_task_id: previewTaskId,
    };

    const refineRes = await axios.post(MESHY_API_URL, refinePayload, {
      headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
    });

    const refineTaskId = refineRes.data.result;
    const refinedTask = await pollTaskStatus(refineTaskId);
    const refinedModelUrl = refinedTask.model_urls?.glb;

    if (!refinedModelUrl) {
      return res.status(500).json({ error: "Refined model URL not available" });
    }

    const response = await axios({
      url: refinedModelUrl,
      method: "GET",
      responseType: "arraybuffer",
      timeout: 20000,
    });

    const buffer = Buffer.from(response.data);
    const fileName = `model-${Date.now()}.glb`;
    const s3Url = await uploadToS3(buffer, fileName, "model/gltf-binary");
    console.log("S3 URL:", s3Url);

    const modelDir = path.resolve(__dirname, "../../public/models/3dassets");
    if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, { recursive: true });
    fs.writeFileSync(path.join(modelDir, fileName), buffer);

    return res.status(200).json({
      success: true,
      s3_model_url: s3Url,
      local_model_url: `/models/3dassets/${fileName}`,
    });
  } catch (error) {
    console.error("imageToModel Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/proxy-glb
const proxyGLB = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith("https://")) {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'url' query param" });
  }

  try {
    const glbRes = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Cache-Control", "public, max-age=3600");
  } catch (err) {
    console.error("GLB proxy error:", err.message);
    res.status(500).json({ error: "Failed to fetch model" });
  }
};

module.exports = {
  imageToModel,
  proxyGLB,
};
