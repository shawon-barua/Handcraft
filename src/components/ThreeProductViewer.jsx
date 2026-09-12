/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sun, Sparkles, X, MessageSquare, Check } from 'lucide-react';

const MATERIALS_PRESETS = [
  { id: 'gold', name: '24K Gold', color: 0xeab308, metalness: 0.92, roughness: 0.22, clearcoat: 0.3 },
  { id: 'silver', name: 'Antique Silver', color: 0xd1d5db, metalness: 0.88, roughness: 0.28, clearcoat: 0.2 },
  { id: 'terracotta', name: 'Terracotta Clay', color: 0xc2410c, metalness: 0.05, roughness: 0.85, clearcoat: 0.0 },
  { id: 'brass', name: 'Beaten Brass', color: 0xb45309, metalness: 0.82, roughness: 0.35, clearcoat: 0.1 },
  { id: 'crimson_silk', name: 'Resham Silk', color: 0x991b1b, metalness: 0.12, roughness: 0.55, clearcoat: 0.4 }
];

const LIGHTING_PRESETS = [
  { id: 'studio', name: 'Studio', ambient: 0xffffff, ambInt: 0.9, dir1: 0xfff5ea, dir1Int: 1.5, dir2: 0xe0f2fe, dir2Int: 1.0 },
  { id: 'warm', name: 'Warm Sun', ambient: 0xffedd5, ambInt: 1.1, dir1: 0xf59e0b, dir1Int: 2.0, dir2: 0xfb923c, dir2Int: 0.8 },
  { id: 'spotlight', name: 'Dramatic', ambient: 0x1e293b, ambInt: 0.4, dir1: 0xffffff, dir1Int: 2.8, dir2: 0x93c5fd, dir2Int: 1.2 }
];

export default function ThreeProductViewer({ product, onClose, onOrderDirect }) {
  const mountRef = useRef(null);
  const [selectedMaterial, setSelectedMaterial] = useState(
    product?.modelType === 'clay_pendant' ? 'terracotta' :
    product?.modelType === 'mans-bracelet' ? 'silver' : 'gold'
  );
  const [selectedLighting, setSelectedLighting] = useState('studio');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const lightsRef = useRef({});
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const reqAnimIdRef = useRef(null);
  const currentRotationRef = useRef({ x: 0.2, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Subtle background studio light ivory color (Aarong luxury style)
    scene.background = new THREE.Color(0xf6f3ed);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clean previous canvases if any
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff7ed, 1.8);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe0f2fe, 0.8);
    dirLight2.position.set(-5, -6, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.4, 20);
    pointLight.position.set(0, 4, 3);
    scene.add(pointLight);

    lightsRef.current = { ambientLight, dirLight1, dirLight2, pointLight };

    // 5. Floor pedestal shadow receiver (Studio marble/stone)
    const pedestalGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.3, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xe8e2d8,
      roughness: 0.6,
      metalness: 0.05
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -2.2;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Subtle Aarong orange/gold rim ring on pedestal
    const rimGeo = new THREE.TorusGeometry(3.55, 0.04, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe26d21, metalness: 0.8, roughness: 0.3 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -2.05;
    scene.add(rim);

    // 6. Build Procedural 3D Mesh based on product modelType
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    buildProduct3DModel(modelGroup, product?.modelType || 'clay_pendant', selectedMaterial);

    // 7. Mouse / Touch Drag Rotation & Zoom Handlers
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      currentRotationRef.current.y += deltaX * 0.008;
      currentRotationRef.current.x += deltaY * 0.008;
      // Clamp vertical tilt
      currentRotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, currentRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch support for mobile
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      currentRotationRef.current.y += deltaX * 0.01;
      currentRotationRef.current.x += deltaY * 0.01;
      currentRotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, currentRotationRef.current.x));

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      setZoomLevel(prev => {
        const next = prev - e.deltaY * 0.0015;
        return Math.max(0.6, Math.min(1.8, next));
      });
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqAnimIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isAutoRotating && !isDraggingRef.current) {
        currentRotationRef.current.y += delta * 0.5;
      }

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = currentRotationRef.current.x;
        modelGroupRef.current.rotation.y = currentRotationRef.current.y;
        // Subtle floating breathing effect
        modelGroupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
      }

      // Smooth camera zoom
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8 / zoomLevel, 0.1);

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(reqAnimIdRef.current);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      domEl.removeEventListener('wheel', onWheel);

      renderer.dispose();
    };
  }, [product, zoomLevel]);

  // Update Material when state changes
  useEffect(() => {
    if (modelGroupRef.current) {
      applyMaterialToGroup(modelGroupRef.current, selectedMaterial);
    }
  }, [selectedMaterial]);

  // Update Lighting when state changes
  useEffect(() => {
    const preset = LIGHTING_PRESETS.find(l => l.id === selectedLighting);
    if (!preset || !lightsRef.current.ambientLight) return;

    lightsRef.current.ambientLight.color.setHex(preset.ambient);
    lightsRef.current.ambientLight.intensity = preset.ambInt;

    lightsRef.current.dirLight1.color.setHex(preset.dir1);
    lightsRef.current.dirLight1.intensity = preset.dir1Int;

    lightsRef.current.dirLight2.color.setHex(preset.dir2);
    lightsRef.current.dirLight2.intensity = preset.dir2Int;
  }, [selectedLighting]);

  // Helper to construct procedural handcrafted 3D meshes
  function buildProduct3DModel(group, type, initialMatId) {
    // Clear existing
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }

    const matConfig = MATERIALS_PRESETS.find(m => m.id === initialMatId) || MATERIALS_PRESETS[0];
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: matConfig.color,
      metalness: matConfig.metalness,
      roughness: matConfig.roughness
    });

    switch (type) {
      case 'bangle': {
        // Handcrafted ornate Torus Bangle
        const mainBangleGeo = new THREE.TorusGeometry(1.6, 0.28, 32, 64);
        const mainBangle = new THREE.Mesh(mainBangleGeo, mainMaterial);
        mainBangle.castShadow = true;
        group.add(mainBangle);

        // Filigree border ridges
        const ridge1Geo = new THREE.TorusGeometry(1.72, 0.05, 16, 64);
        const ridge2Geo = new THREE.TorusGeometry(1.48, 0.05, 16, 64);
        const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
        const ridge1 = new THREE.Mesh(ridge1Geo, ridgeMat);
        const ridge2 = new THREE.Mesh(ridge2Geo, ridgeMat);
        group.add(ridge1);
        group.add(ridge2);

        // Decorative embedded stones around perimeter
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const stoneGeo = new THREE.SphereGeometry(0.08, 12, 12);
          const stoneMat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0xb91c1c : 0x047857,
            roughness: 0.1,
            metalness: 0.1
          });
          const stone = new THREE.Mesh(stoneGeo, stoneMat);
          stone.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0.22);
          group.add(stone);
        }
        break;
      }

      case 'bracelet': {
        // Natural stone/wooden beads on stretch ring
        const count = 22;
        const radius = 1.5;
        const beadGeo = new THREE.SphereGeometry(0.2, 20, 20);

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          let beadMat = mainMaterial;

          // Distinctive accent beads
          if (i === 0) {
            // Lionhead or central master brass bead
            const masterGeo = new THREE.DodecahedronGeometry(0.28, 1);
            const masterMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.3 });
            const masterBead = new THREE.Mesh(masterGeo, masterMat);
            masterBead.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            masterBead.castShadow = true;
            group.add(masterBead);
            continue;
          } else if (i % 5 === 0) {
            beadMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, metalness: 0.05 });
          }

          const bead = new THREE.Mesh(beadGeo, beadMat);
          bead.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
          bead.castShadow = true;
          group.add(bead);
        }
        break;
      }

      case 'earring': {
        // Shepherd's hook top
        const hookCurve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 1.8, 0),
          new THREE.Vector3(0.4, 2.3, 0),
          new THREE.Vector3(0.5, 1.5, 0),
          new THREE.Vector3(0.3, 1.1, 0)
        );
        const hookGeo = new THREE.TubeGeometry(hookCurve, 32, 0.04, 12, false);
        const hookMesh = new THREE.Mesh(hookGeo, mainMaterial);
        group.add(hookMesh);

        // Jump Ring
        const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 16, 32);
        const ringMesh = new THREE.Mesh(ringGeo, mainMaterial);
        ringMesh.position.set(0, 1.0, 0);
        group.add(ringMesh);

        // Intricate Bell / Jhumka Dome
        const domeGeo = new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const domeMesh = new THREE.Mesh(domeGeo, mainMaterial);
        domeMesh.rotation.x = Math.PI;
        domeMesh.position.set(0, 0.7, 0);
        domeMesh.castShadow = true;
        group.add(domeMesh);

        // Hanging tiny ghungroo beads at the bottom of the dome
        for (let j = 0; j < 12; j++) {
          const theta = (j / 12) * Math.PI * 2;
          const dropGeo = new THREE.SphereGeometry(0.09, 12, 12);
          const dropMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
          const drop = new THREE.Mesh(dropGeo, dropMat);
          drop.position.set(Math.cos(theta) * 0.95, -0.25, Math.sin(theta) * 0.95);
          group.add(drop);
        }
        break;
      }

      case 'anklet': {
        // Delicate double-layered ankle payal with musical bells
        const chainGeo1 = new THREE.TorusGeometry(1.6, 0.06, 16, 64);
        const chainGeo2 = new THREE.TorusGeometry(1.75, 0.05, 16, 64);
        const chain1 = new THREE.Mesh(chainGeo1, mainMaterial);
        const chain2 = new THREE.Mesh(chainGeo2, mainMaterial);
        chain1.castShadow = true;
        group.add(chain1);
        group.add(chain2);

        // 14 swinging ghungroo bells
        for (let k = 0; k < 14; k++) {
          const ang = (k / 14) * Math.PI * 2;
          const bellGeo = new THREE.SphereGeometry(0.14, 16, 16);
          const bell = new THREE.Mesh(bellGeo, mainMaterial);
          bell.position.set(Math.cos(ang) * 1.75, Math.sin(ang) * 1.75, -0.2);
          group.add(bell);
        }
        break;
      }

      case 'clay_pendant':
      default: {
        // Sculpted terracotta medallion with concentric relief
        const baseCylinder = new THREE.CylinderGeometry(1.5, 1.5, 0.25, 48);
        const baseMesh = new THREE.Mesh(baseCylinder, mainMaterial);
        baseMesh.rotation.x = Math.PI / 2;
        baseMesh.castShadow = true;
        group.add(baseMesh);

        // Decorative raised mandala center
        const innerCone = new THREE.ConeGeometry(0.7, 0.4, 24);
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
        const centerMesh = new THREE.Mesh(innerCone, centerMat);
        centerMesh.position.set(0, 0, 0.2);
        centerMesh.rotation.x = Math.PI / 2;
        group.add(centerMesh);

        // Outer petal rings
        for (let p = 0; p < 8; p++) {
          const rot = (p / 8) * Math.PI * 2;
          const petalGeo = new THREE.SphereGeometry(0.3, 16, 16);
          petalGeo.scale(1, 0.5, 1);
          const petalMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6, metalness: 0.1 });
          const petal = new THREE.Mesh(petalGeo, petalMat);
          petal.position.set(Math.cos(rot) * 1.1, Math.sin(rot) * 1.1, 0.14);
          group.add(petal);
        }

        // Hanging silk thread cord cords
        const cordCurve1 = new THREE.LineCurve3(new THREE.Vector3(-0.4, 1.4, 0), new THREE.Vector3(-0.9, 2.5, 0));
        const cordCurve2 = new THREE.LineCurve3(new THREE.Vector3(0.4, 1.4, 0), new THREE.Vector3(0.9, 2.5, 0));
        const cordMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
        const cord1 = new THREE.Mesh(new THREE.TubeGeometry(cordCurve1, 16, 0.05, 8, false), cordMat);
        const cord2 = new THREE.Mesh(new THREE.TubeGeometry(cordCurve2, 16, 0.05, 8, false), cordMat);
        group.add(cord1);
        group.add(cord2);
        break;
      }
    }
  }

  function applyMaterialToGroup(group, matId) {
    const config = MATERIALS_PRESETS.find(m => m.id === matId);
    if (!config) return;

    group.traverse(child => {
      if (child.isMesh && child.material) {
        // Preserve distinct accent parts (like red petals or green stone), update core elements
        if (child.material.color.getHex() === 0xeab308 || child.material.color.getHex() === 0xd1d5db || child.material.color.getHex() === 0xc2410c || child.material.color.getHex() === 0xb45309) {
          child.material.color.setHex(config.color);
          child.material.metalness = config.metalness;
          child.material.roughness = config.roughness;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '850px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#ffffff' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={12} color="#c0520d" /> Interactive 3D Showcase
              </span>
              <span style={{ fontSize: '0.8rem', color: '#78716c' }}>Drag to rotate 360° | Scroll to zoom</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', marginTop: '0.2rem', color: '#1c1917' }}>
              {product?.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#f5f3ee',
              border: '1px solid #d6d0c7',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1c1917',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3D Canvas Area */}
        <div style={{ position: 'relative', width: '100%', height: '420px', background: '#f6f3ed' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

          {/* Floating Canvas Overlays */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <button
              title="Toggle 360° Auto-Rotate"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`btn btn-sm ${isAutoRotating ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
            >
              <RotateCw size={16} />
            </button>
            <button
              title="Zoom In"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
              className="btn btn-secondary btn-sm"
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
            >
              <ZoomIn size={16} />
            </button>
            <button
              title="Zoom Out"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
              className="btn btn-secondary btn-sm"
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
            >
              <ZoomOut size={16} />
            </button>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: '#78716c',
            border: '1px solid #e7e2db',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}>
            📐 3D Archetype: <strong style={{ color: '#1c1917', textTransform: 'capitalize' }}>{product?.modelType?.replace('_', ' ') || 'Artisan Design'}</strong>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div style={{
          padding: '1.2rem 1.5rem',
          background: '#ffffff',
          borderTop: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
          alignItems: 'center'
        }}>
          {/* Material Finishes */}
          <div>
            <span style={{ fontSize: '0.8rem', color: '#78716c', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Preview Material Finish:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {MATERIALS_PRESETS.map(mat => (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-full)',
                    border: selectedMaterial === mat.id ? '1px solid #e26d21' : '1px solid #e7e2db',
                    background: selectedMaterial === mat.id ? '#fff7ed' : '#ffffff',
                    color: selectedMaterial === mat.id ? '#c0520d' : '#44403c',
                    cursor: 'pointer',
                    fontWeight: selectedMaterial === mat.id ? 700 : 500,
                    transition: 'var(--transition)'
                  }}
                >
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: `#${mat.color.toString(16).padStart(6, '0')}`,
                    display: 'inline-block',
                    border: '1px solid rgba(0,0,0,0.15)'
                  }}></span>
                  {mat.name}
                  {selectedMaterial === mat.id && <Check size={12} color="#c0520d" />}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting Mode */}
          <div>
            <span style={{ fontSize: '0.8rem', color: '#78716c', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Studio Lighting:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {LIGHTING_PRESETS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLighting(l.id)}
                  className={`btn btn-sm ${selectedLighting === l.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.3rem 0.7rem'
                  }}
                >
                  <Sun size={12} /> {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#78716c' }}>Estimated Price</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#c0520d' }}>
                ৳ {product?.price?.toLocaleString()}
              </div>
            </div>
            <button
              className="btn btn-whatsapp"
              onClick={() => onOrderDirect && onOrderDirect(product)}
              style={{ padding: '0.65rem 1rem' }}
            >
              <MessageSquare size={16} /> Negotiate 3D Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}
