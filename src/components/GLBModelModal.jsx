import React, { useRef, useEffect, useState } from "react";
import { Modal } from "antd";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const GLBModelModal = ({ open, onClose, glbUrl }) => {
  const mountRef = useRef();
  const [ready, setReady] = useState(false); // flag to render after Modal is mounted

  useEffect(() => {
    if (!glbUrl || !mountRef.current) return;

    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize(500, 500);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(
      glbUrl,
      (gltf) => {
        const model = gltf.scene;

        // Normalize the model: center and scale
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        model.position.sub(center); // center it
        const scale = 1.5 / Math.max(size.x, size.y, size.z); // scale to fit
        model.scale.setScalar(scale);

        scene.add(model);
        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading GLB:", error);
      }
    );

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
    };
  }, [ready, glbUrl]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={540}
      centered
      title="3D Model Preview"
      destroyOnClose
      onAfterOpenChange={(openState) => setReady(openState)} // <-- critical hook
    >
      <div
        ref={mountRef}
        style={{ width: 500, height: 500, margin: "0 auto" }}
      />
    </Modal>
  );
};

export default GLBModelModal;
