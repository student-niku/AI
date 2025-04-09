import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Avatar({ isSpeaking }) {
  const mountRef = useRef(null);

  useEffect(() => {
    // Basic Three.js scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(200, 200);
    mountRef.current.appendChild(renderer.domElement);

    // Create avatar (simple cube)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: isSpeaking ? 0xff69b4 : 0xffa500 // Pink when speaking, orange when idle
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 2;

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (isSpeaking) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [isSpeaking]);

  return <div ref={mountRef} className="avatar-container" />;
}
