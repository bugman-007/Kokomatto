import React, { useRef, useState } from "react";

const UploadIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12"
    />
  </svg>
);

const ViewProductModal = ({
  open,
  onClose,
  onSave,
  imageUrl,
  onImageChange,
  name,
  onNameChange,
  description,
  modelUrl,
  onDescriptionChange,
  category,
  onCategoryChange,
}) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Open camera and stream to video element
  const handleAdd3DModel = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraError(
        "Unable to access camera. Please allow camera permission."
      );
      setCameraActive(false);
    }
  };

  // Return all data to parent component
  const handleSave = () => {
    if (onSave) {
      onSave({
      imageUrl,
      name,
      category,
      description,
      modelUrl,
      });
    }
  }

  // Take photo from video stream
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    console.log("dataUrl: ", dataUrl);
    // Stop camera
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    // Pass the image data to parent
    if (onImageChange) {
      // Simulate a synthetic event for compatibility
      onImageChange(
        { target: { files: [], value: dataUrl, dataUrl } },
        dataUrl
      );
    }
  };

  // When modal closes, stop camera if active
  React.useEffect(() => {
    if (!open) {
      // Always stop camera and reset state when modal closes
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
      setCameraError(null);
    }
  }, [open]);

  // Animation classes
  const modalAnim =
    "transition-all duration-300 ease-out scale-95 opacity-0 group-open:scale-100 group-open:opacity-100";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`relative bg-white rounded-2xl shadow-xl flex flex-col items-center w-[90vw] max-w-[45vh] aspect-[9/16] h-[85vh] group ${modalAnim} mt-8`}
        style={{
          animation: "fadeInScale 0.3s cubic-bezier(.4,0,.2,1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 z-20 text-gray-500 hover:text-red-500 text-xl rounded-full p-1 transition"
          onClick={onClose}
          aria-label="Close"
        >
          &#10005;
        </button>

        {/* Image Box / Camera */}
        <div className="relative w-full aspect-square bg-gray-100 rounded-t-2xl overflow-hidden flex items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                className="object-cover w-full h-full"
                autoPlay
                playsInline
                muted
              />
              <button
                className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/70 hover:bg-white/90 text-gray-800 px-4 py-1 rounded-full font-semibold shadow z-20"
                onClick={handleTakePhoto}
                type="button"
              >
                Take a photo
              </button>
              <canvas ref={canvasRef} className="hidden" />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-center p-4">
                  {cameraError}
                </div>
              )}
            </>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Product"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 text-lg">No Image</span>
          )}
          {!cameraActive && (
            <>
              {/* Transparent Upload Button with Upload Icon */}
              <button
                className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition flex items-center justify-center z-10"
                onClick={() => fileInputRef.current.click()}
                type="button"
                aria-label="Upload Image"
              >
                <UploadIcon />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={onImageChange}
              />
            </>
          )}
        </div>

        {/* Inputs & Preview Button */}
        <div className="flex flex-col gap-3 w-full px-6 mt-6">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={onNameChange}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={onDescriptionChange}
            rows={3}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-gray-700 font-semibold"
            value={category}
            onChange={onCategoryChange}
          >
            <option value="">Choose Category</option>
            <option value="Clothing">Clothing</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
            <option value="Athletic Wear">Athletic Wear</option>
          </select>
          <button
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md py-2 font-semibold shadow hover:scale-105 transition"
            onClick={handleAdd3DModel}
            type="button"
          >
            Add 3D Model
          </button>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-between gap-4 w-full px-6 mt-auto mb-6">
          <button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md py-2 font-semibold transition"
            onClick={handleSave}
            type="button"
          >
            Save
          </button>
          <button
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md py-2 font-semibold transition"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95);}
          100% { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  );
};

export default ViewProductModal;
