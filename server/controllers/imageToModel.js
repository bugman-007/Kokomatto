const axios = require("axios");

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_API_URL = "https://api.meshy.ai/openapi/v1/image-to-3d";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    console.log(`Task ${taskId} status: ${task.status} | Progress: ${task.progress}`);
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

    // Step 1: Submit image-to-3d task (preview mode)
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
    console.log("Preview Task ID:", previewTaskId);

    // Step 2: Poll until preview is complete
    const previewTask = await pollTaskStatus(previewTaskId);
    const previewModelUrl = previewTask.model_urls?.glb;

    // Step 3: Submit refinement
    const refinePayload = {
      mode: "refine",
      image_url: image_url,
      preview_task_id: previewTaskId,
    };

    const refineRes = await axios.post(MESHY_API_URL, refinePayload, {
      headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
    });

    const refineTaskId = refineRes.data.result;
    console.log("Refine Task ID:", refineTaskId);

    // Step 4: Poll until refinement completes
    const refinedTask = await pollTaskStatus(refineTaskId);
    const refinedModelUrl = refinedTask.model_urls?.glb;

    if (!refinedModelUrl) {
      return res.status(500).json({ error: "Refined model URL not available" });
    }

    // Return proxy URL instead of raw Meshy URL to avoid CORS issues
    const proxyUrl = `/api/proxy-glb?url=${encodeURIComponent(refinedModelUrl)}`;

    return res.status(200).json({
      success: true,
      // proxy_model_url: proxyUrl,
      // preview_model_url: previewModelUrl,
      refined_model_url: refinedModelUrl,
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
    return res.status(400).json({ error: "Invalid or missing 'url' query param" });
  }

  try {
    const glbRes = await axios.get(url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(glbRes.data);
  } catch (err) {
    console.error("GLB proxy error:", err.message);
    res.status(500).json({ error: "Failed to fetch model" });
  }
};

module.exports = {
  imageToModel,
  proxyGLB,
};
