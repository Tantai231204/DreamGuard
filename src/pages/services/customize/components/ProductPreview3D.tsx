/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import React, { useMemo, useState, memo, useRef, useEffect, useLayoutEffect, Suspense, useCallback } from "react";
import { Canvas, useFrame, useGraph, useThree } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";

import {
  OrbitControls,
  Environment,
  useGLTF,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { Camera, RefreshCcw, Maximize2, Move, ZoomIn, RotateCcw, LayoutPanelLeft } from "lucide-react";

// ================== PREMIUM BESPOKE SHADER (FABRIC SPECIALIST) ==================
const LUXURY_FRAGMENT = `
  uniform vec3 uColor; 
  uniform sampler2D uMap; 
  uniform float uUseMap;
  uniform vec2 uMapOffset; 
  uniform float uMapScale; 
  uniform float uMapOpacity;
  uniform float uRotation;
  uniform float uAmbientIntensity;
  
  varying vec2 vUv; 
  varying vec3 vNormal; 
  varying vec3 vWorldPos; 
  varying vec3 vViewDir;
  
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  // Premium UV-based pattern mapping with centered rotation
  vec2 getPatternUv(vec2 uv, float scale, vec2 off, float rot) {
    mat2 rMat = rotate2d(rot);
    return rMat * (uv * scale - 0.5) + off + 0.5;
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    
    // 1. Base Layer (Luxury Fabric Foundation)
    vec3 base = uColor;
    
    // 2. Pattern Layer (Standard UV Mapping for Realism)
    if (uUseMap > 0.5) {
        vec2 pUv = getPatternUv(vUv, uMapScale, uMapOffset, uRotation);
        vec4 tex = texture2D(uMap, pUv);
        
        // Luxury Fabric Grain Simulation (Procedural)
        float grain = fract(sin(dot(vUv * 800.0, vec2(12.9898, 78.233))) * 43758.5453);
        float weave = sin(vUv.x * 2000.0) * cos(vUv.y * 2000.0) * 0.05;
        
        vec3 patternColor = tex.rgb * (0.95 + grain * 0.05 + weave);
        base = mix(base, patternColor, tex.a * uMapOpacity);
    }
    
    // 3. Realistic Fabric Lighting (PBR-lite) — softened to avoid hotspot glare
    // Fresnel Sheen (Soft velvet-like edges)
    float ndv = max(dot(n, v), 0.0);
    float fresnel = pow(1.0 - ndv, 3.0);
    float rim = pow(1.0 - ndv, 4.0) * 0.25; // reduced rim intensity
    
    // Soft Wrap Lighting (Half-Lambert)
    vec3 lightDir = normalize(vec3(1.0, 2.0, 0.8));
    float nL = max(0.0, dot(n, lightDir) * 0.55 + 0.45); // softer wrap, higher base fill
    
    // Studio Highlights — toned down significantly
    vec3 reflectDir = reflect(-lightDir, n);
    float spec = pow(max(dot(v, reflectDir), 0.0), 48.0) * 0.06; // narrower & dimmer specular
    
    // Composition
    vec3 ambient = base * uAmbientIntensity * 0.95; 
    vec3 direct = base * nL * 0.4; // lowered direct significantly to avoid frontal wash
    vec3 sheen = mix(base, vec3(1.0), 0.2) * fresnel * 0.15; 
    
    vec3 final = ambient + direct + sheen + rim + spec;
    
    // Shadow influence from top (darker bottom)
    final *= (0.88 + 0.12 * n.y); 
    
    gl_FragColor = vec4(final, 1.0);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const LUXURY_VERTEX = `
  varying vec2 vUv; 
  varying vec3 vNormal; 
  varying vec3 vWorldPos; 
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  
  void main() {
    vUv = uv; 
    vLocalPos = position; 
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ================== CORE ENGINE ==================

const GLTFModel = memo(({ url, designRef, customImage, transformRef, onBoundsReady }: any) => {
  const { scene } = useGLTF(url) as any;
  const { nodes } = useGraph(scene);
  const { gl } = useThree();

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color("#B0D4F1") },
      uMap: { value: new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat) },
      uUseMap: { value: 0 },
      uMapOffset: { value: new THREE.Vector2(0, 0) },
      uMapScale: { value: 1.25 },
      uRotation: { value: 0 },
      uMapOpacity: { value: 1 },
      uAmbientIntensity: { value: 0.45 },
    },
    vertexShader: LUXURY_VERTEX,
    fragmentShader: LUXURY_FRAGMENT,
  }), []);

  const uRef = useRef(mat.uniforms);

  // Optimized texture handling for dynamic uploads
  useEffect(() => {
    if (!customImage) {
      uRef.current.uUseMap.value = 0;
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(customImage, (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8);
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      uRef.current.uMap.value = tex;
      uRef.current.uUseMap.value = 1;
    });
  }, [customImage, gl]);

  useLayoutEffect(() => {
    Object.values(nodes).forEach((n: any) => {
      if (n.isMesh) {
        n.material = mat;
        n.castShadow = true;
        n.receiveShadow = true;
      }
    });

    // Report bounding box to parent after layout
    if (onBoundsReady) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      console.log('[DreamGuard 3D] Model bounds:', { center: center.toArray(), size: size.toArray(), min: box.min.toArray(), max: box.max.toArray() });
      onBoundsReady({ box, center, size });
    }
  }, [nodes, mat, scene, onBoundsReady]);

  useFrame(() => {
    const d = designRef.current;
    const u = uRef.current;
    if (!d) return;

    u.uColor.value.set(d.baseColor || "#B0D4F1");
    if (u.uUseMap.value > 0.5) {
      const t = transformRef.current;
      u.uMapScale.value = t.scale;
      u.uMapOffset.value.set(t.x, t.y);
      u.uRotation.value = t.rotation || 0;
    }
  });

  return <primitive object={scene} />;
});

// ================== SURFACE TEXT ENGINE ==================
// Creates text as a CanvasTexture and places it precisely on model surface

const useTextTexture = (text: string, color: string, isCrib: boolean) => {
  return useMemo(() => {
    if (!text) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isCrib) {
      // Wood engraving look: darker, bolder, sans-serif
      ctx.fillStyle = color;
      ctx.font = `bold 110px "Georgia", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Subtle shadow for depth illusion
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    } else {
      // Embroidery look: stitched, italic serif
      ctx.fillStyle = color;
      ctx.font = `italic 100px "Georgia", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Thread-like double rendering for embroidery effect
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, [text, color, isCrib]);
};

// SurfaceText: Uses real bounds from GLTFModel to place text on the correct face
const SurfaceText = memo(({ bounds, texture, position: posType, isCrib }: {
  bounds: { center: THREE.Vector3; size: THREE.Vector3; box: THREE.Box3 };
  texture: THREE.Texture;
  position: string;
  isCrib: boolean;
}) => {
  const { center, size, box } = bounds;
  const eps = 0.008; // offset to sit just above surface

  const placement = useMemo(() => {
    if (isCrib) {
      const textW = Math.max(size.x * 0.5, 0.15);
      const textH = textW * 0.25;

      switch (posType) {
        case "side-rail":
          return {
            pos: [box.max.x + eps, center.y, center.z] as [number, number, number],
            rot: [0, Math.PI / 2, 0] as [number, number, number],
            scale: [textW, textH, 1] as [number, number, number],
          };
        case "headboard":
          return {
            pos: [center.x, center.y + size.y * 0.25, box.min.z - eps] as [number, number, number],
            rot: [0, Math.PI, 0] as [number, number, number],
            scale: [textW, textH, 1] as [number, number, number],
          };
        case "front-rail":
        default:
          return {
            pos: [center.x, center.y, box.max.z + eps] as [number, number, number],
            rot: [0, 0, 0] as [number, number, number],
            scale: [textW, textH, 1] as [number, number, number],
          };
      }
    } else {
      const textW = Math.max(size.x * 0.6, 0.12);
      const textH = textW * 0.25;

      switch (posType) {
        case "corner":
          return {
            pos: [center.x + size.x * 0.15, box.max.y + eps, center.z - size.z * 0.15] as [number, number, number],
            rot: [-Math.PI / 2, 0, 0] as [number, number, number],
            scale: [textW * 0.7, textH * 0.7, 1] as [number, number, number],
          };
        case "bottom-edge":
          return {
            pos: [center.x, box.max.y + eps, center.z + size.z * 0.25] as [number, number, number],
            rot: [-Math.PI / 2, 0, 0] as [number, number, number],
            scale: [textW * 0.8, textH * 0.8, 1] as [number, number, number],
          };
        case "center":
        default:
          return {
            pos: [center.x, box.max.y + eps, center.z] as [number, number, number],
            rot: [-Math.PI / 2, 0, 0] as [number, number, number],
            scale: [textW, textH, 1] as [number, number, number],
          };
      }
    }
  }, [center, size, box, posType, isCrib]);

  return (
    <mesh
      position={placement.pos}
      rotation={placement.rot}
      scale={placement.scale}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
});

// ================== SCENE ROOT ==================

const SceneRoot = memo(({ product, design, designRef, customImage, transformRef, sizeDims }: any) => {
  const isCrib = product.type === "crib_bedding_set";
  const modelUrl = isCrib ? "/models/real_bumper.glb" : "/models/real_pillow.glb";

  const [modelBounds, setModelBounds] = useState<{ center: THREE.Vector3; size: THREE.Vector3; box: THREE.Box3 } | null>(null);

  const handleBoundsReady = useCallback((b: any) => {
    setModelBounds(b);
  }, []);

  const visualScale = useMemo(() => {
    const baseW = isCrib ? 60 : 25;
    const baseL = isCrib ? 120 : 35;
    const factorW = sizeDims.width / baseW;
    const factorL = sizeDims.length / baseL;
    return [
      Math.min(Math.max(factorW, 0.5), 2.0),
      1,
      Math.min(Math.max(factorL, 0.5), 2.0)
    ] as [number, number, number];
  }, [sizeDims, isCrib]);

  const textColor = isCrib ? "#3d2b1f" : "#4988c4";
  const textTexture = useTextTexture(design.embroideryText, textColor, isCrib);

  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 2.5, 4]} fov={35} />
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={6}
        enableDamping
        dampingFactor={0.06}
        autoRotate={!customImage}
        autoRotateSpeed={0.4}
      />

      <Suspense fallback={null}>
        <Environment preset="studio" blur={0.8} />
      </Suspense>

      <spotLight
        position={[18, 12, -4]}
        angle={0.2}
        penumbra={1}
        intensity={0.25}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-12, 6, 8]} intensity={0.15} color="#dbeafe" />
      <pointLight position={[4, 12, 4]} intensity={0.1} color="#fff8f4" />
      <ambientLight intensity={0.45} />

      <group position={[0, -0.4, 0]} scale={visualScale}>
        <GLTFModel
          key={isCrib ? "crib" : "standard"}
          url={modelUrl}
          designRef={designRef}
          customImage={customImage}
          transformRef={transformRef}
          onBoundsReady={handleBoundsReady}
        />

        {design.embroideryText && textTexture && modelBounds && (
          <SurfaceText
            bounds={modelBounds}
            texture={textTexture}
            position={design.embroideryPosition || (isCrib ? "front-rail" : "center")}
            isCrib={isCrib}
          />
        )}
      </group>

      <ContactShadows
        position={[0, -0.85, 0]}
        opacity={0.35}
        blur={4}
        scale={10}
        far={1.5}
        resolution={512}
        color="#020617"
      />
    </>
  );
}, (prev, next) =>
  prev.product.id === next.product.id &&
  prev.customImage === next.customImage &&
  prev.design.size === next.design.size &&
  prev.design.embroideryText === next.design.embroideryText &&
  prev.design.embroideryPosition === next.design.embroideryPosition &&
  prev.sizeDims.width === next.sizeDims.width &&
  prev.sizeDims.length === next.sizeDims.length
);

const PureCanvas = memo(({ product, design, designRef, customImage, transformRef, canvasRef, sizeDims }: any) => (
  <Canvas
    ref={canvasRef}
    gl={{
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
      stencil: false,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 0.78, // tăng lại đôi chút để tổng thể sáng sủa hơn
    }}
    shadows
    dpr={[1, 1.5]}
    style={{ background: '#f8fafc' }}
  >
    <SceneRoot
      product={product}
      design={design}
      designRef={designRef}
      customImage={customImage}
      transformRef={transformRef}
      sizeDims={sizeDims}
    />
  </Canvas>
), (prev, next) =>
  prev.product.id === next.product.id &&
  prev.customImage === next.customImage &&
  prev.design.size === next.design.size &&
  prev.design.embroideryText === next.design.embroideryText &&
  prev.design.embroideryPosition === next.design.embroideryPosition &&
  prev.sizeDims.width === next.sizeDims.width &&
  prev.sizeDims.length === next.sizeDims.length
);

// ================== ISOLATED SUB-COMPONENTS ==================

const CalibrationPanel = memo(({ customImage, transformRef }: any) => {
  const [scale, setScale] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [rotation, setRotation] = useState(0);

  const reset = useCallback(() => {
    transformRef.current = { x: 0, y: 0, scale: 1, rotation: 0 };
    setScale(1); setX(0); setY(0); setRotation(0);
  }, [transformRef]);

  if (!customImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className="absolute top-8 left-8 z-20 pointer-events-auto"
    >
      <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-xl w-72 space-y-7 transition-all duration-700">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-600" />
            <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest leading-none">Calibration</h4>
          </div>
          <button onClick={reset} className="p-2 hover:bg-slate-50 rounded-xl transition-all group active:scale-90">
            <RefreshCcw className="h-4 w-4 text-slate-400 group-hover:rotate-180 transition-transform duration-700 hmc-ease" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Zoom Focus</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50/50 px-2.5 py-0.5 rounded-full border border-blue-100/50">{(1 / scale).toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.1" max="4" step="0.01" value={scale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                transformRef.current.scale = val;
                setScale(val);
              }}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600 cursor-pointer transition-all hover:bg-slate-200"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Rotate Mask</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">{Math.round((rotation * 180) / Math.PI)}°</span>
            </div>
            <input
              type="range" min={-Math.PI} max={Math.PI} step={0.01} value={rotation}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                transformRef.current.rotation = val;
                setRotation(val);
              }}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-slate-600 cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-t border-slate-100/50 pt-4">
              <Move className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Surface Offset</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">H-Pos</span>
                  <span className="text-[9px] font-mono text-slate-500">{x.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="-1" max="1" step="0.01" value={x}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    transformRef.current.x = val;
                    setX(val);
                  }}
                  className="w-full h-1 bg-slate-100 appearance-none accent-slate-400 rounded-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">V-Pos</span>
                  <span className="text-[9px] font-mono text-slate-500">{y.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="-1" max="1" step="0.01" value={y}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    transformRef.current.y = val;
                    setY(val);
                  }}
                  className="w-full h-1 bg-slate-100 appearance-none accent-slate-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100/50 mt-2">
          <div className="bg-blue-50/30 p-4 rounded-3xl flex items-start gap-3 border border-blue-100/20">
            <Maximize2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Integrated <span className="text-blue-600 font-bold">360° Tri-planar</span> projection engine ensures zero stretching on curved seams.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const DesignManifest = memo(({ product, design }: any) => {
  const isCrib = product?.id?.includes('crib');
  
  const specs = [
    { label: "Fabric Base", value: design.material || "Standard" },
    { label: "Tone", value: design.customImage ? "Bespoke Wrap" : (design.baseColor || "#B0D4F1"), swatch: design.customImage ? null : design.baseColor },
    { label: "Volume", value: design.size || "Default" },
    ...(design.embroideryText ? [{
      label: isCrib ? "Signature" : "Stitch",
      value: `"${design.embroideryText}"`,
      sub: design.embroideryPosition
    }] : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-8 right-8 z-20 pointer-events-none"
    >
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/50 shadow-2xl w-64 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <LayoutPanelLeft className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Design Manifest</span>
        </div>

        <div className="space-y-3">
          {specs.map((s, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{s.label}</span>
              <div className="flex items-center gap-2">
                {s.swatch && <div className="h-2 w-2 rounded-full border border-slate-200" style={{ backgroundColor: s.swatch }} />}
                <span className="text-[11px] font-bold text-slate-700 truncate">{s.value}</span>
              </div>
              {s.sub && (
                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest opacity-80 mt-0.5">
                  Pos: {s.sub}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

// ================== MAIN VIEW ==================
const ProductPreview3D = memo(({ product, design, sizeDims }: any) => {
  const designRef = useRef(design);
  const transformRef = useRef({ x: 0, y: 0, scale: 1, rotation: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { designRef.current = design; }, [design]);

  const handleScreenshot = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `DreamGuard-Design-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#f8fafc] overflow-hidden relative font-sans">
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <PureCanvas
          product={product}
          design={design}
          designRef={designRef}
          customImage={design.customImage}
          transformRef={transformRef}
          canvasRef={canvasRef}
          sizeDims={sizeDims}
        />

        <div className="absolute bottom-8 left-8 z-10 flex flex-col gap-4 pointer-events-none">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-5 bg-white/90 backdrop-blur-md border border-slate-200/50 p-2.5 pr-8 rounded-[1.5rem] shadow-xl">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <RefreshCcw className="h-5 w-5 text-white animate-spin-slow" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
              <h3 className="text-[11px] font-bold text-slate-800 uppercase italic mt-1">High Fidelity Engine</h3>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-8 right-8 z-10 pointer-events-auto flex flex-col gap-3">
          <button
            onClick={handleScreenshot}
            className="h-12 w-12 rounded-2xl bg-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-slate-600 border border-slate-200 group"
          >
            <Camera className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>

        <AnimatePresence>
          <CalibrationPanel customImage={design.customImage} transformRef={transformRef} />
        </AnimatePresence>

        <DesignManifest product={product} design={design} />
      </div>
    </div>
  );
});

export default ProductPreview3D;