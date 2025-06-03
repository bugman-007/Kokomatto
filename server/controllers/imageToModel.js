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

const imageToModel = async (req, res) => {
  try {
    const {image_url} = req.body;
    if (!image_url) {
      return res.status(400).json({ error: "No image_url provided" });
    }

    // Step 1: Start preview task
    const previewPayload = {
      mode: "preview",
      // prompt: "A small cat", // Optional: Modify or customize using image_url later
      // negative_prompt: "low quality, low resolution, low poly, ugly",
      // art_style: "realistic",
      image_url: `${image_url}`,
      enable_pbr: true,
      should_remesh: true,
      should_texture: true,
    };

    const previewRes = await axios.post(MESHY_API_URL, previewPayload, {
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
      },
    });

    const previewTaskId = previewRes.data.result;
    console.log("Preview Task ID:", previewTaskId);

    // Step 2: Poll until preview is done
    const previewTask = await pollTaskStatus(previewTaskId);
    const previewModelUrl = previewTask.model_urls?.glb;

    // Step 3: Start refinement
    const refinePayload = {
      mode: "refine",
      image_url: `${image_url}`,
      preview_task_id: previewTaskId,
    };

    const refineRes = await axios.post(MESHY_API_URL, refinePayload, {
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
      },
    });

    const refineTaskId = refineRes.data.result;
    console.log("Refine Task ID:", refineTaskId);

    // Step 4: Poll until refined model is ready
    const refinedTask = await pollTaskStatus(refineTaskId);
    const refinedModelUrl = refinedTask.model_urls?.glb;

    console.log("Result Preview Model URL:", refinedModelUrl);
    return res.status(200).json({
      success: true,
      preview_model_url: previewModelUrl,
      refined_model_url: refinedModelUrl,
    });

  } catch (error) {
    // console.error("imageToModel Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  imageToModel,
};
