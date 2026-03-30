/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import React, {
  Suspense,
  useMemo,
  useState,
  memo,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";

import {
  OrbitControls,
  Environment,
  useGLTF,
  Html,
  PerspectiveCamera,
  ContactShadows,
  Decal,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { Sparkles, ShoppingCart, Camera, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomizableProduct, DesignConfig } from "../types";

// ================== SHADER ==================
const LUXURY_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  varying vec3 vWorldNormal;
  
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LUXURY_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uPattern;
  uniform float uPatternScale;
  uniform float uPatternOpacity;
  uniform sampler2D uMap;
  uniform float uUseMap;
  uniform float uMapRepeat;
  uniform vec2 uMapOffset;
  uniform float uMapScale;
  uniform float uMapOpacity;
  uniform float uTime;
  uniform float uWarpStrength;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  varying vec3 vWorldNormal;

  vec4 tri(sampler2D m, vec3 p, vec3 n, float s, vec2 off, float sc) {
    vec3 w = abs(n);
    w = w / (w.x + w.y + w.z + 0.0001);
    vec3 st = p * s * sc;
    vec4 cx = texture2D(m, st.yz + off);
    vec4 cy = texture2D(m, st.xz + off);
    vec4 cz = texture2D(m, st.xy + off);
    return cx * w.x + cy * w.y + cz * w.z;
  }

  void main() {
    vec3 base = uColor;
    
    // 1. Safe Image Wrap
    vec3 wPos = vWorldPos;
    wPos += sin(vWorldPos.y * 4.0 + uTime) * uWarpStrength;
    vec4 tex = tri(uMap, wPos, vWorldNormal, uMapRepeat, uMapOffset, uMapScale);
    base = mix(base, tex.rgb, tex.a * uMapOpacity * uUseMap);
    
    // 2. Optimized Procedural Patterns (Step-based for Mobile)
    vec2 safeUv = (vUv.x + vUv.y < 0.001) ? vWorldPos.xz * 1.5 : vUv;
    vec2 pUv = fract(safeUv * uPatternScale);
    float pM = 0.0;
    float pIdx = floor(uPattern + 0.5);
    
    if (pIdx > 3.5) pM = 1.0 - smoothstep(0.2, 0.25, length(pUv - 0.5));
    else if (pIdx > 1.5) pM = step(0.5, sin(safeUv.x * 20.0 + safeUv.y * 20.0));
    else if (pIdx > 0.5) pM = 1.0 - smoothstep(0.15, 0.2, length(pUv - 0.5));
    base = mix(base, vec3(1.0), pM * uPatternOpacity);
    
    // 3. Nike-Style Luxury Fabric Lighting
    float dotNV = max(dot(vNormal, vViewDir), 0.0);
    float sheen = pow(1.0 - dotNV, 3.5);
    vec3 finalLit = base * (0.85 + vNormal.y * 0.15); // Global soft light
    finalLit += base * sheen * 0.35; // Sheen fabric effect
    
    gl_FragColor = vec4(finalLit, 1.0);
  }
`;

// ================== SAFE DECAL ==================
const SafeDecal = ({ url, position, rotation, scale }: any) => {
  const texture = useTexture(url);

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshPhysicalMaterial
        map={texture}
        transparent
        polygonOffset
        polygonOffsetFactor={-10}
        polygonOffsetUnits={-10}
        roughness={0.7}
        metalness={0.05}
        clearcoat={0.3}
        clearcoatRoughness={0.2}
      />
    </Decal>
  );
};

// ================== TEXTURE SAMPLER ==================
const TextureSampler = ({ url, onLoaded }: any) => {
  const texture = useTexture(url);

  useEffect(() => {
    if (!texture) return;

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    onLoaded(texture);
  }, [texture, onLoaded]);

  return null;
};

// ================== GLTF MODEL ==================
const GLTFModel = ({
  url,
  designRef,
  customImage,
  imageMode,
  transform = { x: 0, y: 0, scale: 1 },
}: any) => {
  const gltf = useGLTF(url) as any;
  const { scene } = gltf;

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const luxuryMat = useMemo(() => {
    const d = new THREE.DataTexture(
      new Uint8Array([255, 255, 255, 255]),
      1,
      1,
      THREE.RGBAFormat
    );
    d.needsUpdate = true;

    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#B0D4F1") },
        uPattern: { value: 0 },
        uPatternScale: { value: 12 },
        uPatternOpacity: { value: 0.15 },
        uMap: { value: d },
        uUseMap: { value: 0 },
        uMapRepeat: { value: 2.2 },
        uMapOffset: { value: new THREE.Vector2(0, 0) },
        uMapScale: { value: 1 },
        uMapOpacity: { value: 1 },
        uTime: { value: 0 },
        uWarpStrength: { value: 0.012 },
      },
      vertexShader: LUXURY_VERTEX,
      fragmentShader: LUXURY_FRAGMENT,
      side: THREE.DoubleSide,
    });
  }, []);

  // Reset khi đổi model
  useEffect(() => {
    setTexture(null);
    const u = luxuryMat.uniforms;
    u.uUseMap.value = 0;
    u.uMapOffset.value.set(0, 0);
    u.uMapScale.value = 1;
  }, [url, luxuryMat]);

  // Apply material
  useLayoutEffect(() => {
    clonedScene.traverse((c: any) => {
      if (c.isMesh) {
        c.material = luxuryMat;
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
  }, [clonedScene, luxuryMat]);

  // Tìm mesh chính
  const tMesh = useMemo(() => {
    let best: any = null;
    let max = 0;

    clonedScene.traverse((c: any) => {
      if (c.isMesh && c.geometry?.attributes?.position) {
        const count = c.geometry.attributes.position.count;
        if (count > max) {
          max = count;
          best = c;
        }
      }
    });

    return best;
  }, [clonedScene]);

  // Update shader
  useFrame((state) => {
    const d = designRef.current;
    if (!d) return;

    const u = luxuryMat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uColor.value.set(d.baseColor || "#B0D4F1");

    const idx = ["solid", "stars", "stripes", "clouds", "dots"].indexOf(d.pattern);
    u.uPattern.value = idx >= 0 ? idx : 0;

    const isWrap = customImage && texture && imageMode === "wrap";
    u.uUseMap.value = isWrap ? 1 : 0;

    if (isWrap) {
      u.uMapScale.value = transform.scale;
      u.uMapOffset.value.set(transform.x, transform.y);
    }
  });

  // Apply texture cho Wrap mode
  useEffect(() => {
    if (texture) {
      luxuryMat.uniforms.uMap.value = texture;
    }
  }, [texture, luxuryMat]);

  return (
    <group>
      <primitive object={clonedScene} />

      {/* WRAP MODE */}
      {customImage && imageMode === "wrap" && (
        <TextureSampler
          key={`wrap-${customImage}`}
          url={customImage}
          onLoaded={setTexture}
        />
      )}

      {/* PRINT MODE - ĐÃ SỬA */}
      {customImage && imageMode === "print" && tMesh && (
        <mesh
          geometry={tMesh.geometry}
          position={tMesh.position}
          rotation={tMesh.rotation}
          scale={tMesh.scale}
        >
          <Suspense fallback={null}>
            <SafeDecal
              key={`print-${customImage}`}
              url={customImage}
              position={[transform.x, transform.y, 0.3]}
              rotation={[0, 0, 0]}
              scale={[0.4 * transform.scale, 0.4 * transform.scale, 0.4]}
            />
          </Suspense>
        </mesh>
      )}
    </group>
  );
};

// ================== SCENE ROOT ==================
const SceneRoot = memo(({ product, designRef, currentDesign, transform }: any) => {
  const isCrib = product.id === "crib_bedding_set";

  const autoRotate = !currentDesign.embroideryText?.trim();

  return (
    <>
      <PerspectiveCamera makeDefault position={[3, 2, 3]} fov={25} />

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        enableDamping
        dampingFactor={0.06}
        autoRotate={autoRotate && transform.scale === 1}
      />

      <Environment preset="apartment" />

      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} intensity={1.5} castShadow />

      <group position={[0, -0.4, 0]}>
        <GLTFModel
          key={product.id}
          url={isCrib ? "/models/real_bumper.glb" : "/models/real_pillow.glb"}
          designRef={designRef}
          customImage={currentDesign.customImage}
          imageMode={currentDesign.imageMode}
          transform={transform}
        />
      </group>

      <ContactShadows opacity={0.3} blur={2.5} />
    </>
  );
});

// ================== MAIN COMPONENT ==================
const ProductPreview3D = memo(({ product, design, totalPrice }: any) => {
  const designRef = useRef(design);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    designRef.current = design;
  }, [design]);

  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [product.id]);

  const handleScreenshot = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `DreamGuard-Design-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#f8fafc] overflow-hidden relative group font-sans">
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <Canvas
          ref={canvasRef}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true,
            alpha: true,
          }}
          dpr={[1, 2]}
          shadows={{ type: THREE.PCFShadowMap }}
        >
          <SceneRoot
            key={product.id}
            product={product}
            designRef={designRef}
            currentDesign={design}
            transform={transform}
          />
        </Canvas>

        {/* UI Overlay */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-white/70 backdrop-blur-3xl border border-white p-2 pr-6 rounded-2xl shadow-2xl"
          >
            <div className="h-10 w-10 rounded-xl bg-[#4988c4] flex items-center justify-center shadow-lg">
              <RefreshCcw className="h-5 w-5 text-white animate-spin-slow" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest">Engine</p>
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                NIKE-TECH PBR 2.1
              </span>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
          <button
            onClick={handleScreenshot}
            title="Capture 4K Snapshot"
            className="h-12 w-12 rounded-2xl bg-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-slate-600 hover:text-[#4988c4] border border-slate-100"
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>

        {/* Image Adjustment Panel */}
        <AnimatePresence>
          {design.customImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 left-8 z-20 pointer-events-auto"
            >
              <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white shadow-2xl w-64 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                    Adjust Image
                  </h4>
                  <button
                    onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
                    className="text-[10px] font-bold text-[#4988c4] hover:underline"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                    <span>Zoom</span>
                    <span className="text-slate-800">{Math.round(transform.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.01"
                    value={transform.scale}
                    onChange={(e) =>
                      setTransform((t) => ({ ...t, scale: parseFloat(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4988c4]"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Position</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Horizontal</span>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={transform.x}
                        onChange={(e) =>
                          setTransform((t) => ({ ...t, x: parseFloat(e.target.value) }))
                        }
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4988c4]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Vertical</span>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={transform.y}
                        onChange={(e) =>
                          setTransform((t) => ({ ...t, y: parseFloat(e.target.value) }))
                        }
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4988c4]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <InteractionLayer />
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-10 left-10 right-10 z-10 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#0f172a]/95 backdrop-blur-xl p-2 pl-10 pr-2 rounded-[3rem] shadow-2xl flex items-center gap-10 pointer-events-auto border border-white/10"
        >
          <div className="py-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Configuration Price
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white leading-tight font-mono">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
              </span>
            </div>
          </div>
          <button className="h-16 px-12 rounded-[2.5rem] bg-white text-slate-950 text-[11px] font-black uppercase hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-3">
            <ShoppingCart className="h-4 w-4" />
            Add to Selection
          </button>
        </motion.div>
      </div>
    </div>
  );
});

const InteractionLayer = memo(() => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0] }}
    transition={{ duration: 3, times: [0, 0.2, 1] }}
    className="absolute inset-0 flex items-center justify-center pointer-events-none"
  >
    <p className="text-[11px] font-black text-[#4988c4] uppercase tracking-[0.4em] bg-white/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/50">
      360° Studio
    </p>
  </motion.div>
));

export default ProductPreview3D;