import React, { useRef, useEffect, useState } from "react";

const TakePhotoModal = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    if (open) {
      setCameraError("");
      setCapturedImage(null);
      // Start camera
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          setCameraError(
            "Unable to access camera. Please check your device permissions."
          );
        });
    }
    // Cleanup: stop camera when modal closes
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleUsePhoto = () => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full relative"
        style={{
          width: "50vw",
          height: "80vh",
          maxWidth: "none",
          maxHeight: "none",
        }}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4 text-center">
          Take a Product Photo
        </h3>
        {cameraError ? (
          <div className="text-red-600 text-center mb-4">{cameraError}</div>
        ) : (
          <>
            {!capturedImage ? (
              <div className="flex flex-col items-center h-full justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="rounded-lg bg-black w-full h-[60%] mb-4 object-contain"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 mt-4"
                  onClick={handleCapture}
                >
                  Capture Photo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="rounded-lg mb-4 border"
                  style={{
                    width: videoRef.current?.videoWidth
                      ? `${videoRef.current.videoWidth}px`
                      : "100%",
                    height: videoRef.current?.videoHeight
                      ? `${videoRef.current.videoHeight}px`
                      : "auto",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300"
                    onClick={handleRetake}
                  >
                    Retake
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                    onClick={handleUsePhoto}
                  >
                    Use Photo
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </>
        )}
      </div>
    </div>
  );
};

export default TakePhotoModal;