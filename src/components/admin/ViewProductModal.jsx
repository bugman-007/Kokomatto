import React, { useRef } from "react";

const CameraIcon = () => (
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
      d="M15 10l4.553 2.276A2 2 0 0121 14.09V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.91a2 2 0 01.447-1.814L8 10m7-4V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v0m7 0h-2m-6 0H5"
    />
  </svg>
);

const ViewProductModal = ({
  open,
  onClose,
  onSave,
  onPreview3D,
  image,
  onImageChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
}) => {
  const fileInputRef = useRef(null);

  // Close modal when clicking outside content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Animation classes
  const modalAnim =
    "transition-all duration-300 ease-out scale-95 opacity-0 group-open:scale-100 group-open:opacity-100";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
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

        {/* Image Box */}
        <div className="relative w-full aspect-square bg-gray-100 rounded-t-2xl overflow-hidden flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt="Product"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 text-lg">No Image</span>
          )}
          {/* Transparent Upload Button with Icon */}
          <button
            className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition flex items-center justify-center z-10"
            onClick={() => fileInputRef.current.click()}
            type="button"
            aria-label="Upload Image"
          >
            <CameraIcon />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={onImageChange}
          />
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
          <button
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md py-2 font-semibold shadow hover:scale-105 transition"
            onClick={onPreview3D}
            type="button"
          >
            Add 3D Model
          </button>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-between gap-4 w-full px-6 mt-auto mb-6">
          <button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md py-2 font-semibold transition"
            onClick={onSave}
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
