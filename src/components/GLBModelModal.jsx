import React, { useRef, useEffect } from "react";
import { Modal } from "antd";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const GLBModelModal = ({ open, onClose, glbUrl }) => {
  const mountRef = useRef();

  useEffect(() => {
    if (!open || !glbUrl) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize(500, 500);

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Load GLB
    const loader = new GLTFLoader();
    loader.load(
      glbUrl,
      (gltf) => {
        scene.add(gltf.scene);
        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading GLB:", error);
      }
    );

    // Animate
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [open, glbUrl]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={540}
      centered
      title="3D Model Preview"
      destroyOnClose
    >
      <div
        ref={mountRef}
        style={{ width: 500, height: 500, margin: "0 auto" }}
      />
    </Modal>
  );
};

export default GLBModelModal;