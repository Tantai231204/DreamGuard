/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import React, { Suspense, useMemo, useState, memo, useRef, useEffect } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { motion } from "framer-motion";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Html,
  PerspectiveCamera,
  ContactShadows,
  Float,
  Decal,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { Sparkles, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomizableProduct, DesignConfig, EmbroideryPosition } from "../types";

/* ═══════════════════════════════════════════
   SHADERS & CUSTOM MATERIALS
   ═══════════════════════════════════════════ */
const FabricShader = {
  uniforms: {
    uColor: { value: new THREE.Color("#B0D4F1") },
    uPattern: { value: 0 },
    uPatternScale: { value: 20.0 },
    uPatternOpacity: { value: 0.12 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(cameraPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform int uPattern;
    uniform float uPatternScale;
    uniform float uPatternOpacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vec3 color = uColor;
      vec2 uv = vUv * uPatternScale;
      float pattern = 0.0;

      if (uPattern == 4) { // Dots
        vec2 p = fract(uv) - 0.5;
        pattern = smoothstep(0.3, 0.25, length(p));
      } else if (uPattern == 2) { // Stripes
        pattern = smoothstep(0.45, 0.5, sin(uv.x * 2.5 + uv.y * 2.5));
      } else if (uPattern == 1) { // Stars
        vec2 p = fract(uv * 1.5) - 0.5;
        pattern = smoothstep(0.2, 0.1, length(p));
      }

      float lum = dot(uColor, vec3(0.299, 0.587, 0.114));
      vec3 patternColor = lum > 0.6 ? vec3(0.0) : vec3(1.0);
      color = mix(color, patternColor, pattern * uPatternOpacity);
      
      float fresnel = 1.0 - max(dot(vNormal, vViewDir),   0.0);
      fresnel = pow(fresnel, 3.0); 
      color = mix(color, color * 1.25, fresnel * 0.3);
      
      float diff = max(dot(vNormal, vec3(0.5, 0.7, 1.0)), 0.0);
      color += diff * 0.03;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

class FabricMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      ...FabricShader,
      side: THREE.DoubleSide,
    });
  }
}

extend({ FabricMaterial });

interface ProductPreview3DProps {
  product: CustomizableProduct;
  design: DesignConfig;
  totalPrice: number;
  onPositionChange: (pos: EmbroideryPosition) => void;
}

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

const isLightColor = (hex: string) => {
  const c = new THREE.Color(hex);
  return (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) > 0.6;
};

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */
const generateEngravingTex = (text: string, isLight: boolean, isEmbroidery = false) => {
  const S = 512;
  const canvas = document.createElement("canvas"); canvas.width = S; canvas.height = isEmbroidery ? 128 : 160;
  const ctx = canvas.getContext("2d")!;

  if (!isEmbroidery) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#d4a76a"); grad.addColorStop(1, "#8b6914");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, S, canvas.height);
  }

  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fontSize = Math.min(isEmbroidery ? 48 : 56, (S - 40) / text.length * 1.6);
  ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
  ctx.fillStyle = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)";
  ctx.fillText(text.toUpperCase(), S / 2, canvas.height / 2 + 2);
  ctx.fillStyle = isEmbroidery ? (isLight ? "#1e293b" : "#f8fafc") : "#2a190a";
  ctx.fillText(text.toUpperCase(), S / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const PositionHotspot = memo(({ position, rotation, label, isActive, onClick }: any) => {
  const [hovered, setHovered] = useState(false);
  const color = isActive ? "#4988c4" : hovered ? "#6ba3d6" : "#cbd5e1";

  return (
    <group position={position} rotation={rotation}>
      <mesh
        onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <sphereGeometry args={[isActive ? 0.045 : 0.035, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 2 : hovered ? 1 : 0.4}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Outer Pulse Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.06, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {(hovered || isActive) && (
        <Html center distanceFactor={4} pointerEvents="none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "px-4 py-2 rounded-2xl backdrop-blur-2xl border flex items-center gap-2 whitespace-nowrap shadow-2xl transition-all duration-500",
              isActive
                ? "bg-[#4988c4]/90 border-[#4988c4]/50 text-white"
                : "bg-white/80 border-white/40 text-slate-800"
            )}
          >
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isActive ? "bg-white" : "bg-[#4988c4]")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
          </motion.div>
        </Html>
      )}
    </group>
  );
});

const DecalLayer = ({ url, position, rotation, scale }: { url: string; position: any; rotation: any; scale: any }) => {
  const texture = useTexture(url);
  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshBasicMaterial map={texture} transparent polygonOffset polygonOffsetFactor={-10} />
    </Decal>
  );
};

const WrappedMaterialChild = ({ url }: { url: string }) => {
  const texture = useTexture(url);
  const clonedTexture = useMemo(() => {
    if (!texture) return null;
    const t = texture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3.5, 3.5);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [texture]);
  if (!clonedTexture) return null;
  return <meshPhysicalMaterial map={clonedTexture} roughness={0.8} metalness={0.05} />;
};

const GLTFModel = memo(({ url, designRef, customImage, imageMode, isCrib }: { url: string; designRef: React.MutableRefObject<DesignConfig>; customImage?: string; imageMode: "print" | "wrap"; isCrib: boolean }) => {
  const { scene } = useGLTF(url);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const woodTex = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#E5C299"; ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 128; i++) { ctx.fillStyle = `rgba(139,105,20, 0.05)`; ctx.fillRect(0, i, 128, 1); }
    return new THREE.CanvasTexture(canvas);
  }, []);

  const wMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: woodTex, roughness: 0.5, metalness: 0.1 }), [woodTex]);

  const targetMesh = useMemo(() => {
    let best: THREE.Mesh | null = null;
    let maxV = 0;
    scene.traverse((c: any) => {
      if (c.isMesh && !c.name.toLowerCase().includes("wood") && !c.name.toLowerCase().includes("leg")) {
        const count = c.geometry.attributes.position.count;
        if (count > maxV) { maxV = count; best = c; }
      }
    });
    return best;
  }, [scene]);

  useFrame(() => {
    if (materialRef.current?.uniforms && designRef.current) {
      const color = designRef.current.baseColor || "#B0D4F1";
      materialRef.current.uniforms.uColor.value.set(color);

      const patternIdx = ["solid", "stars", "stripes", "clouds", "dots"].indexOf(designRef.current.pattern);
      materialRef.current.uniforms.uPattern.value = patternIdx >= 0 ? patternIdx : 0;

      // If we are wrapping, make the base shader material invisible
      materialRef.current.visible = !(customImage && imageMode === 'wrap');
    }
  });

  useEffect(() => {
    if (scene && materialRef.current) {
      scene.traverse((c: any) => {
        if (c.isMesh) {
          const n = (c.name || "").toLowerCase();
          const isWood = n.includes("wood") || n.includes("frame") || n.includes("leg");
          c.material = isWood ? wMat : materialRef.current;
          c.castShadow = c.receiveShadow = true;
        }
      });
    }
  }, [scene, wMat]);

  return (
    <group>
      <primitive object={scene} />
      {/* @ts-ignore */}
      <fabricMaterial ref={materialRef} transparent={false} />

      {customImage && targetMesh && (
        <Suspense fallback={null}>
          {imageMode === 'wrap' ? (
            <mesh
              geometry={targetMesh.geometry}
              position={targetMesh.position}
              rotation={targetMesh.rotation}
              scale={targetMesh.scale}
            >
              <WrappedMaterialChild url={customImage} />
            </mesh>
          ) : (
            <mesh
              geometry={targetMesh.geometry}
              position={targetMesh.position}
              rotation={targetMesh.rotation}
              scale={targetMesh.scale}
            >
              <DecalLayer
                url={customImage}
                position={isCrib ? [0, 0.45, 0.35] : [0, 0.8, 0.3]}
                rotation={isCrib ? [0, 0, 0] : [-Math.PI / 8, 0, 0]}
                scale={isCrib ? [0.35, 0.35, 0.35] : [0.4, 0.4, 0.4]}
              />
            </mesh>
          )}
        </Suspense>
      )}
    </group>
  );
});

const PersonalizationLayer = memo(({ isCrib, text, color, position, onPositionChange }: any) => {
  const positions: any = isCrib ? CRIB_POSITIONS : PILLOW_POSITIONS;
  const light = isLightColor(color);
  const tex = useMemo(() => generateEngravingTex(text, light, !isCrib), [text, light, isCrib]);
  const activeCfg = positions[position] || (isCrib ? CRIB_POSITIONS["front-rail"] : PILLOW_POSITIONS["center"]);

  return (
    <group>
      {Object.entries(positions).map(([key, cfg]: [string, any]) => (
        <PositionHotspot key={key} position={cfg.pos} rotation={cfg.rot} label={cfg.label}
          isActive={position === key} onClick={() => onPositionChange(key)} />
      ))}
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <group position={activeCfg.pos} rotation={activeCfg.rot}>
          <mesh castShadow>
            {isCrib ? <boxGeometry args={activeCfg.plateSize} /> : <planeGeometry args={[0.6, 0.12]} />}
            <meshPhysicalMaterial map={tex} transparent={!isCrib} roughness={isCrib ? 0.3 : 0.95} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-5} depthWrite={isCrib} />
          </mesh>
        </group>
      </Float>
    </group>
  );
});

const SceneRoot = memo(({ product, designRef, onPositionChange, currentDesign }: any) => {
  const isCrib = product.id === "crib_bedding_set";
  const [showLayer, setShowLayer] = useState(!!currentDesign.embroideryText.trim());
  const [localDesign, setLocalDesign] = useState<DesignConfig>(currentDesign);

  useFrame(() => {
    if (designRef.current) {
      const hasText = designRef.current.embroideryText.trim().length > 0;
      if (hasText !== showLayer) setShowLayer(hasText);

      // detect all properties that require a React re-render of the subtree
      const needsUpdate =
        designRef.current.embroideryText !== localDesign.embroideryText ||
        designRef.current.embroideryPosition !== localDesign.embroideryPosition ||
        designRef.current.customImage !== localDesign.customImage ||
        designRef.current.imageMode !== localDesign.imageMode;

      if (needsUpdate) {
        setLocalDesign({ ...designRef.current });
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.8, 1.8, 2.8]} fov={28} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2}
        maxDistance={5.5}
        enableDamping
        dampingFactor={0.05}
        autoRotate={!showLayer}
        autoRotateSpeed={0.4}
      />
      <Environment preset="apartment" />
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 10, 5]} intensity={2} castShadow />

      <group position={[0, -0.4, 0]}>
        <Suspense fallback={null}>
          <GLTFModel
            url={isCrib ? "/models/real_bumper.glb" : "/models/real_pillow.glb"}
            designRef={designRef}
            customImage={localDesign.customImage}
            imageMode={localDesign.imageMode}
            isCrib={isCrib}
          />
        </Suspense>
        {showLayer && localDesign && (
          <PersonalizationLayer
            isCrib={isCrib}
            text={localDesign.embroideryText}
            color={localDesign.baseColor}
            position={localDesign.embroideryPosition}
            onPositionChange={onPositionChange}
          />
        )}
      </group>
      <ContactShadows resolution={256} scale={10} blur={2.5} opacity={0.25} far={1} color="#000" />
    </>
  );
});

/* ═══════════════════════════════════════════
   PREMIUM UI OVERLAYS (MEMOIZED)
   ═══════════════════════════════════════════ */

const TopHUD = memo(({ productId }: { productId: string }) => (
  <div className="absolute top-8 left-8 z-10 flex flex-col gap-4 pointer-events-none">
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-center gap-4 bg-white/40 backdrop-blur-3xl border border-white/40 p-1.5 pr-5 rounded-2xl shadow-2xl"
    >
      <div className="h-10 w-10 rounded-xl bg-[#4988c4] flex items-center justify-center shadow-lg shadow-[#4988c4]/20">
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-[9px] font-black text-[#4988c4] uppercase tracking-[0.2em] mb-0.5">Engine Status</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Active • Optimized</span>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex items-center gap-3 bg-white/40 backdrop-blur-3xl border border-white/40 px-4 py-2.5 rounded-xl shadow-xl"
    >
      <div className="text-[10px] font-black text-slate-400 font-mono">SKU:</div>
      <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{productId}</div>
    </motion.div>
  </div>
));

const InteractionGuide = memo(() => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 1, 0] }}
    transition={{ duration: 4, times: [0, 0.1, 0.8, 1] }}
    className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
  >
    <div className="flex flex-col items-center gap-4">
      <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#4988c4]/30 animate-spin-slow flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-[#4988c4]" />
      </div>
      <p className="text-[10px] font-black text-[#4988c4] uppercase tracking-[0.3em]">Drag to Explore 360°</p>
    </div>
  </motion.div>
));

const BottomHUD = memo(({ price }: { price: number }) => (
  <div className="absolute bottom-10 left-10 right-10 z-10 flex justify-center pointer-events-none">
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/40 backdrop-blur-3xl border border-white/60 p-2 rounded-[2.5rem] shadow-2xl flex items-center gap-6 pointer-events-auto"
    >
      <div className="pl-8 py-4">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 font-mono">Total Customization</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">GOTS Certified</span>
        </div>
      </div>
      <div className="h-12 w-px bg-slate-200/50" />
      <button className="h-14 px-10 rounded-[2rem] bg-[#0f172a] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 active:scale-95 group">
        <ShoppingCart className="h-4 w-4" />
        Add to Selection
      </button>
    </motion.div>
  </div>
));

const ProductPreview3D = memo(({ product, design, totalPrice, onPositionChange }: ProductPreview3DProps) => {
  const designRef = useRef(design);
  const invalidateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    designRef.current = design;
    if (invalidateRef.current) {
      invalidateRef.current();
    }
  }, [design]);

  const canvasContent = useMemo(() => {
    return (
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        dpr={1}
        frameloop="demand"
        onCreated={({ invalidate }) => { invalidateRef.current = invalidate; }}
      >
        <SceneRoot product={product} designRef={designRef} onPositionChange={onPositionChange} currentDesign={design} />
      </Canvas>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, onPositionChange]);

  return (
    <div className="w-full h-full flex flex-col bg-[#f8fafc] overflow-hidden relative group">
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        {canvasContent}
        <TopHUD productId={product.id} />
        <InteractionGuide />
      </div>
      <BottomHUD price={totalPrice} />
    </div>
  );
});

export default ProductPreview3D;
