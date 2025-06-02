const axios = require("axios");
const FormData = require("form-data");

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_API_URL = "https://api.tripo3d.ai/v2/openapi/task";

async function uploadBase64Image(base64String) {
  try {
    const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid Base64 image format");
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const form = new FormData();
    form.append("file", buffer, {
      filename: "upload.png",
      contentType: contentType,
    });

    const response = await axios.post(TRIPO_API_URL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    });

    if (!response.data || !response.data.data || !response.data.data.image_token) {
      throw new Error("Image token not found in Tripo3D response");
    }

    return response.data.data.image_token;
  } catch (error) {
    console.error("Upload Error:", error.response?.data || error.message);
    throw error;
  }
}

const imageToModel = async (req, res) => {
  try {
    const image_url = req.body.image_url;
    if (!image_url) {
      return res.status(400).json({ error: "No image_url provided" });
    }

    const imageToken = await uploadBase64Image(image_url);

    const payload = {
      type: "image_to_model",
      file: {
        type: "jpg", // or 'png', based on input
        file_token: imageToken,
      },
    };

    const response = await axios.post(TRIPO_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("imageToModel Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  imageToModel,
};
