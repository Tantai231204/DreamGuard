/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Html,
  PerspectiveCamera
} from "@react-three/drei";
import * as THREE from "three";
import type { DesignConfig, CustomizableProduct } from "../types";
import { colorOptions } from "../data";

/* ═══════════════════════════════════════════
   TEXTURES & MATERIALS
   ═══════════════════════════════════════════ */
// Mẫu Pattern nội bộ sinh động (đã Tối ưu Vượt Trội về Tốc Độ & Độ Nét)
function createFabricTexture(colorHex: string, patternId: string) {
  const S = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d", { alpha: false })!; // Optimize RAM

  // 1. Phủ màu nền rực rỡ
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, S, S);

  // Lựa chọn màu hoa văn sắc nét hơn
  const isLight = new THREE.Color(colorHex).getHSL({ h: 0, s: 0, l: 0 }).l > 0.6;
  const pColor = isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.3)";
  ctx.fillStyle = pColor;
  ctx.strokeStyle = pColor;

  // 2. Vẽ hoa văn
  if (patternId === 'dots') {
    for (let i = 0; i < 200; i++) {
      ctx.beginPath(); ctx.arc(Math.random() * S, Math.random() * S, 6, 0, Math.PI * 2); ctx.fill();
    }
  } else if (patternId === 'stripes') {
    ctx.lineWidth = 25;
    for (let i = -S; i < S * 2; i += 70) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + S, S); ctx.stroke();
    }
  } else if (patternId === 'stars') {
    ctx.font = "bold 24px sans-serif";
    for (let i = 0; i < 150; i++) ctx.fillText("⭐", Math.random() * S, Math.random() * S);
  } else if (patternId === 'clouds') {
    ctx.font = "bold 30px sans-serif";
    for (let i = 0; i < 60; i++) ctx.fillText("☁️", Math.random() * S, Math.random() * S);
  }

  // 3. Vi sợi vải dệt (Micro-fabric noise) - Cực kì nhẹ & rực màu
  // Không lặp 5000 lần trực tiếp, vẽ lên canvas nhỏ rồi mix-blend ốp hàng loạt!
  const noiseCanv = document.createElement("canvas");
  noiseCanv.width = 64; noiseCanv.height = 64;
  const nCtx = noiseCanv.getContext("2d")!;
  nCtx.fillStyle = "rgba(0,0,0,0.06)";
  for (let i = 0; i < 300; i++) nCtx.fillRect(Math.random() * 64, Math.random() * 64, 1.5, 1.5);
  nCtx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 300; i++) nCtx.fillRect(Math.random() * 64, Math.random() * 64, 1.5, 1.5);

  ctx.globalCompositeOperation = "overlay"; // Trộn sáng, làm màu không bị đục
  ctx.fillStyle = ctx.createPattern(noiseCanv, 'repeat')!;
  ctx.fillRect(0, 0, S, S);
  ctx.globalCompositeOperation = "source-over";

  // 4. Khởi tạo Texture SIÊU NÉT với băng thông VRAM tối ưu
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 4; // Tối ưu VRAM (Mức 4 là đủ nét cho 4K mà không nghẽn)
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const getPBRProps = (materialId: string) => {
  switch (materialId) {
    case "hypoallergenic_silk":
      return { roughness: 0.1, sheen: 1.0, sheenColor: "#ffffff", clearcoat: 0.5 };
    case "bamboo_fiber":
      return { roughness: 0.5, sheen: 0.5, sheenColor: "#ccffee" };
    default:
      return { roughness: 0.8, sheen: 0.2, sheenColor: "#ffffff" };
  }
};

/* ═══════════════════════════════════════════
   PROFESSIONAL GLTF MODEL LOADER (Ultra Perf Tier)
   ═══════════════════════════════════════════ */
// Tối thượng độ mượt: Tái chế Material và xóa Deep Clone
const GLTFProductModel = ({ url, texture, materialProps, scale = 1, position = [0, 0, 0] }: any) => {
  // Lấy dữ liệu file 3D (Ép kiểu as any để tắt cảnh báo type rườm rà)
  const { scene } = useGLTF(url) as any;

  // Tối ưu lõi: Tái sử dụng chung 1 vật lý duy nhất, không tạo rác RAM
  const customMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: texture,
      ...materialProps,
      // CẤM DÙNG DoubleSide -> Render FrontSide x2 tốc độ khung hình (FPS)
      side: THREE.FrontSide,
      envMapIntensity: 0.8, // Giảm phản chiếu môi trường để màu sắc thật hơn
    });
  }, [texture, materialProps]);

  // Bắn vật rỉ vào lưới 3D NGAY TRÊN BẢN GỐC để tắt nghẽn sao chép lưới điểm
  useMemo(() => {
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = customMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene, customMaterial]);

  if (!scene) return null;
  return <primitive object={scene} scale={scale} position={position} />;
};

/* ═══════════════════════════════════════════
   FALLBACK PROCEDURAL GEOMETRIES
   ═══════════════════════════════════════════ */
function FallbackPillow({ texture, mat }: any) {
  return (
    <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
      <boxGeometry args={[1.2, 0.3, 0.8, 32, 8, 32]} />
      <meshPhysicalMaterial map={texture} {...mat} />
    </mesh>
  );
}

// Render thông minh cho Pillow & Crib (Dùng file .glb thật)
const SmartProductRender = ({ product, texture, mat }: any) => {
  // Đối với bộ cũi: Chỉ hiển thị duy nhất file real_bumper.glb bạn đã cung cấp
  if (product.id === 'crib_bedding_set') {
    return (
      <Suspense fallback={null}>
        <GLTFProductModel url="/models/real_bumper.glb" texture={texture} materialProps={mat} />
      </Suspense>
    );
  }

  // Đối với gối: Dùng file real_pillow.glb bạn đã cung cấp
  if (product.id === 'pillow') {
    return (
      <Suspense fallback={<FallbackPillow texture={texture} mat={mat} />}>
        <GLTFProductModel url="/models/real_pillow.glb" texture={texture} materialProps={mat} />
      </Suspense>
    );
  }

  return <FallbackPillow texture={texture} mat={mat} />;
};

/* ═══════════════════════════════════════════
   SCENE ASSEMBLY
   ═══════════════════════════════════════════ */
const StudioLighting = () => (
  <>
    <Environment preset="city" /> {/* Chuyển sang preset City để có chiều sâu bóng đổ tốt hơn Studio */}
    <ambientLight intensity={0.2} /> {/* Giảm sáng tổng thể để khối hiện rõ hơn */}
    {/* Key Light: Giảm cường độ tránh cháy sáng */}
    <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={1.2} shadow-bias={-0.0001} castShadow />
    {/* Fill Light: Ánh sáng xanh nhẹ làm dịu mắt */}
    <pointLight position={[-5, 5, -5]} intensity={0.5} color="#eef6ff" />
    {/* Rim Light: Tạo viền bóng bẩy */}
    <rectAreaLight width={5} height={5} color="#ffffff" intensity={1} position={[0, 2, -5]} rotation={[-Math.PI, 0, 0]} />
  </>
);

const SceneRoot = ({ product, design }: { product: CustomizableProduct; design: DesignConfig }) => {
  const color = colorOptions.find(c => c.id === design.baseColor)?.hex || "#ffffff";
  const texture = useMemo(() => createFabricTexture(color, design.pattern), [color, design.pattern]);
  const mat = useMemo(() => getPBRProps(design.material), [design.material]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.5, 2.0, 2.5]} fov={30} />
      <OrbitControls
        makeDefault
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={2}
        maxDistance={6}
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
      />

      <StudioLighting />

      <group>
        <SmartProductRender product={product} texture={texture} mat={mat} />

        {/* Hiệu ứng Thêu chữ: Dùng Html overlay (Troika Text bị lỗi thư viện) */}
        {design.embroideryText && (
          <group position={product.id === 'pillow' ? [0, 0.32, 0] : [0, 0.14, 0]}>
            <Html
              center
              transform
              occlude={false}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.12}
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 }).l > 0.6 ? '#1e293b' : '#f8fafc',
                textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 0px 1px rgba(0,0,0,0.15)',
                textTransform: 'uppercase',
              }}>
                {design.embroideryText}
              </div>
            </Html>
          </group>
        )}
      </group>
    </>
  );
};


/* ═══════════════════════════════════════════
   MAIN UI
   ═══════════════════════════════════════════ */
export default function ProductPreview3D({ product, design, totalPrice }: {
  product: CustomizableProduct;
  design: DesignConfig;
  totalPrice: number;
}) {
  const formatPrice = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  return (
    <div className="w-full h-full flex flex-col bg-[#E5E7EB] overflow-hidden rounded-[2rem] border border-slate-300/50 shadow-inner relative">
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">

        {/* Canvas Ưu Tiên Tốc Độ Phần Cứng Tối Đa */}
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.9, // Giảm phơi sáng tổng thể
            powerPreference: "high-performance"
          }}
        >
          <SceneRoot product={product} design={design} />
        </Canvas>
      </div>

      <div className="p-5 bg-white border-t border-slate-100 flex justify-between items-center z-10">
        <div>
          <h3 className="font-black text-slate-800 tracking-tight">{product.name}</h3>
          <p className="text-xs text-slate-500 font-medium">3D Engine: R3F & Three.js</p>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-black text-blue-600 leading-none">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
