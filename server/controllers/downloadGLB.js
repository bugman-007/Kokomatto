// server/controllers/downloadGLB.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const downloadGLB = async (req, res) => {
  const modelUrl = req.body.url;

  if (!modelUrl) {
    return res.status(400).json({ error: "modelUrl is required" });
  }

  try {
    const response = await axios({
      url: modelUrl,
      method: "GET",
      responseType: "stream",
    });

    const fileName = `model-${Date.now()}.glb`;
    const modelDir = path.resolve(__dirname, "../../public/models/3dassets");
    const filePath = path.join(modelDir, fileName);

    // Ensure the directory exists
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      res
        .status(200)
        .json({ success: true, fileName, localUrl: `/models/3dassets/${fileName}` });
    });

    writer.on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to save the GLB file" });
    });
  } catch (error) {
    console.error("Download error:", error.message);
    res.status(500).json({ error: "Failed to download the GLB file" });
  }
};

module.exports = { downloadGLB };
