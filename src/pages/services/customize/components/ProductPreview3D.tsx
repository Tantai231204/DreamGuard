/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useMemo, useState, memo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Html,
  PerspectiveCamera,
  AdaptiveDpr,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";
import { colorOptions } from "../data";
import type { CustomizableProduct, DesignConfig, EmbroideryPosition } from "../types";

interface ProductPreview3DProps {
  product: CustomizableProduct;
  design: DesignConfig;
  totalPrice: number;
  onPositionChange: (pos: EmbroideryPosition) => void;
}

/* ═══════════════════════════════════════════
   OPTIMIZED TEXTURE CACHE & CONSTANTS
   ═══════════════════════════════════════════ */
const textureCache = new Map<string, THREE.CanvasTexture>();

const CRIB_POSITIONS = {
  "front-rail": { pos: [0, 0.45, 0.35], rot: [0, 0, 0], plateSize: [0.5, 0.12, 0.02], label: "Front Rail" },
  "side-rail": { pos: [0.7, 0.45, 0], rot: [0, Math.PI / 2, 0], plateSize: [0.4, 0.12, 0.02], label: "Side Rail" },
  "headboard": { pos: [0, 0.55, -0.35], rot: [0, Math.PI, 0], plateSize: [0.55, 0.14, 0.02], label: "Headboard" },
};

const PILLOW_POSITIONS = {
  "center": { pos: [0, 0.60, 0], rot: [-Math.PI / 2, 0, 0], label: "Center" },
  "corner": { pos: [0.35, 0.60, 0.22], rot: [-Math.PI / 2, 0, 0], label: "Corner" },
  "bottom-edge": { pos: [0, 0.55, 0.50], rot: [-Math.PI / 2, 0, 0], label: "Bottom Edge" },
};

const PBR_PRESETS = {
  organic_cotton: { roughness: 0.8, sheen: 0.15, envMapIntensity: 0.4 },
  bamboo_fiber: { roughness: 0.5, sheen: 0.6, envMapIntensity: 0.6 },
  hypoallergenic_silk: { roughness: 0.1, sheen: 1.0, envMapIntensity: 1.0, clearcoat: 0.4 },
  cotton_blend: { roughness: 0.7, envMapIntensity: 0.35 },
  muslin: { roughness: 0.9, transmission: 0.08, envMapIntensity: 0.3 },
};

const WOOD_PROPS = { roughness: 0.55, sheen: 0.05, envMapIntensity: 0.5, clearcoat: 0.2 };

/* ═══════════════════════════════════════════
   TEXTURE GENERATORS (Deterministic & Pure)
   ═══════════════════════════════════════════ */
const isLightColor = (hex: string) => new THREE.Color(hex).getHSL({ h: 0, s: 0, l: 0 }).l > 0.6;

const generateFabricTex = (color: string, pattern: string, matId: string) => {
  const key = `${color}_${pattern}_${matId}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const S = 512;
  const canvas = document.createElement("canvas"); canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const light = isLightColor(color);

  ctx.fillStyle = color; ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < S; i += 8) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke(); }

  const pColor = light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)";
  ctx.fillStyle = ctx.strokeStyle = pColor;
  if (pattern === "dots") { for (let i = 0; i < 100; i++) { ctx.beginPath(); ctx.arc((i * 17) % S, (i * 23) % S, 4, 0, Math.PI * 2); ctx.fill(); } }
  else if (pattern === "stripes") { ctx.lineWidth = 15; for (let i = -S; i < S * 2; i += 60) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + S, S); ctx.stroke(); } }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3);
  tex.anisotropy = 4; tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex); return tex;
};

const generateWoodTex = () => {
  const key = "__WOOD__"; if (textureCache.has(key)) return textureCache.get(key)!;
  const S = 512; const canvas = document.createElement("canvas"); canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.fillStyle = "#D4A76A"; ctx.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y++) {
    const b = 140 + Math.sin(y * 0.08) * 12 + Math.sin(y * 7) * 2;
    ctx.fillStyle = `rgb(${b + 40}, ${b + 10}, ${b - 30})`; ctx.fillRect(0, y, S, 1);
  }
  const tex = new THREE.CanvasTexture(canvas); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2); tex.anisotropy = 4; tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex); return tex;
};

const generateEngravingTex = (text: string, isLight: boolean, isEmbroidery = false) => {
  const key = `__TXT__${text}_${isLight}_${isEmbroidery}`; if (textureCache.has(key)) return textureCache.get(key)!;
  const W = 512, H = isEmbroidery ? 96 : 128;
  const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  if (!isEmbroidery) {
    ctx.fillStyle = "#8B6914"; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y++) { const b = 100 + Math.sin(y * 0.15) * 5; ctx.fillStyle = `rgb(${b + 35}, ${b + 5}, ${b - 30})`; ctx.fillRect(0, y, W, 1); }
    ctx.strokeStyle = "#6b4f1a"; ctx.lineWidth = 4; ctx.roundRect(4, 4, W - 8, H - 8, 10); ctx.stroke();
  } else { ctx.clearRect(0, 0, W, H); }

  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fontSize = Math.min(isEmbroidery ? 42 : 48, (W - 40) / text.length * 1.5);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.2)"; ctx.fillText(text.toUpperCase(), W / 2, H / 2 + 2);
  ctx.fillStyle = isEmbroidery ? (isLight ? "#1a1a2e" : "#f5f0e8") : "#2a190a"; ctx.fillText(text.toUpperCase(), W / 2, H / 2);

  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex); return tex;
};

/* ═══════════════════════════════════════════
   UI COMPONENTS (Memoized)
   ═══════════════════════════════════════════ */
const PositionHotspot = memo(({ position, rotation, label, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const color = isActive ? "#4988c4" : hovered ? "#6ba3d6" : "#94a3b8";
  return (
    <group position={position} rotation={rotation}>
      <mesh onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 1 : 0.4} />
      </mesh>
      {(hovered || isActive) && (
        <Html center distanceFactor={4} style={{ pointerEvents: "none" }}>
          <div className="px-2 py-1 bg-[#4988c4] text-white text-[9px] font-bold rounded shadow-lg transform -translate-y-4">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
});

/* ═══════════════════════════════════════════
   MODEL ENGINE (Material & Mesh Reuse)
   ═══════════════════════════════════════════ */
const GLTFModel = memo(({ url, fabricTex, fabricProps, woodTex }) => {
  const { scene } = useGLTF(url);
  const fMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: fabricTex, ...fabricProps }), [fabricTex, fabricProps]);
  const wMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: woodTex, ...WOOD_PROPS }), [woodTex]);

  useMemo(() => {
    if (scene) scene.traverse((c: any) => {
      if (c.isMesh) {
        const n = (c.name || "").toLowerCase();
        c.material = (n.includes("wood") || n.includes("frame") || n.includes("leg")) ? wMat : fMat;
        c.castShadow = c.receiveShadow = true;
      }
    });
  }, [scene, fMat, wMat]);

  return scene ? <primitive object={scene} /> : null;
});

const PersonalizationLayer = memo(({ isCrib, text, color, position, onPositionChange }) => {
  const positions = isCrib ? CRIB_POSITIONS : PILLOW_POSITIONS;
  const light = isLightColor(color);
  const tex = useMemo(() => generateEngravingTex(text, light, !isCrib), [text, light, isCrib]);
  const activeCfg = positions[position] || (isCrib ? CRIB_POSITIONS["front-rail"] : PILLOW_POSITIONS["center"]);

  return (
    <group>
      {Object.entries(positions).map(([key, cfg]) => (
        <PositionHotspot key={key} position={cfg.pos} rotation={cfg.rot} label={cfg.label}
          isActive={position === key} onClick={() => onPositionChange?.(key)} />
      ))}
      <group position={activeCfg.pos} rotation={activeCfg.rot}>
        <mesh castShadow>
          {isCrib ? <boxGeometry args={activeCfg.plateSize} /> : <planeGeometry args={[0.55, 0.1]} />}
          <meshPhysicalMaterial
            map={tex}
            transparent={!isCrib}
            roughness={isCrib ? 0.4 : 0.9}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={isCrib ? 0 : -5}
            polygonOffsetUnits={isCrib ? 0 : -5}
            depthWrite={isCrib}
            alphaTest={isCrib ? 0 : 0.05}
          />
        </mesh>
        {isCrib && (
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[activeCfg.plateSize[0] + 0.01, activeCfg.plateSize[1] + 0.01]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.15} />
          </mesh>
        )}
      </group>
    </group>
  );
});

/* ═══════════════════════════════════════════
   SCENE ROOT
   ═══════════════════════════════════════════ */
const SceneRoot = ({ product, design, onPositionChange }) => {
  const isCrib = product.id === "crib_bedding_set";
  const colorHex = colorOptions.find(c => c.id === design.baseColor)?.hex || "#ffffff";
  const fabricTex = useMemo(() => generateFabricTex(colorHex, design.pattern, design.material), [colorHex, design.pattern, design.material]);
  const fabricProps = useMemo(() => PBR_PRESETS[design.material] || PBR_PRESETS.organic_cotton, [design.material]);
  const woodTex = useMemo(() => generateWoodTex(), []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.5, 2.0, 2.5]} fov={30} />
      <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={6} enableDamping />
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <spotLight position={[5, 8, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />

      <group>
        <GLTFModel url={isCrib ? "/models/real_bumper.glb" : "/models/real_pillow.glb"}
          fabricTex={fabricTex} fabricProps={fabricProps} woodTex={woodTex} />
        {design.embroideryText.trim().length > 0 && (
          <PersonalizationLayer isCrib={isCrib} text={design.embroideryText} color={colorHex}
            position={design.embroideryPosition} onPositionChange={onPositionChange} />
        )}
      </group>
      <Preload all />
      <AdaptiveDpr pixelated />
    </>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const ProductPreview3D = memo(({ product, design, totalPrice, onPositionChange }: ProductPreview3DProps) => {
  const formatPrice = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  // Isolate Canvas from direct price re-renders if price is the only change
  const renderCanvas = useMemo(() => (
    <Canvas shadows gl={{ antialias: false, powerPreference: "high-performance" }} frameloop="demand" dpr={[1, 2]}>
      <Suspense fallback={null}>
        <SceneRoot product={product} design={design} onPositionChange={onPositionChange} />
      </Suspense>
    </Canvas>
  ), [product, design, onPositionChange]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-200 overflow-hidden rounded-[2rem] border border-slate-300 relative group">
      <div className="flex-1 relative cursor-grab">
        {renderCanvas}
        {design.embroideryText.trim() && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
              📍 Click 3D dots to reposition
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center z-10">
        <div className="space-y-0.5">
          <h3 className="font-black text-slate-800 tracking-tight leading-none">{product.name}</h3>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Premium 3D Studio</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Total Amount</span>
          <span className="text-xl font-black text-[#4988c4] leading-none tabular-nums">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
});

export default ProductPreview3D;
