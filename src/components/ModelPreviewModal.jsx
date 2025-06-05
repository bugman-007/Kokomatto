import React, { useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useProgress,
  useGLTF,
} from "@react-three/drei";
import Modal from "react-modal";

// Modal.setAppElement("#root");

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white bg-black px-4 py-2 rounded">
        Loading {progress.toFixed(2)}%
      </div>
    </Html>
  );
}

export default function ModelPreviewModal({ isOpen, onClose, modelUrl }) {
  const [localUrl, setLocalUrl] = useState(modelUrl);

  const Model=({ url })=> {
    const gltf = useGLTF(url, true);
    return <primitive object={gltf.scene} dispose={null} />
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="3D Model Viewer"
      style={{
        content: {
          inset: "10%",
          padding: 0,
          backgroundColor: "#000",
        },
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          right: 20,
          top: 20,
          zIndex: 1,
          color: "white",
        }}
      >
        Close
      </button>

      <Canvas camera={{ position: [0, 0, 3] }} style={{ background: "#fff" }}>
        <Suspense fallback={<Loader />}>
          {localUrl && <Model url={localUrl} />}
          <OrbitControls enablePan enableZoom enableRotate />
          <Environment preset="warehouse" />
        </Suspense>
      </Canvas>
    </Modal>
  );
}
