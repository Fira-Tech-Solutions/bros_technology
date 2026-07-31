import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import * as THREE from "three";

function FloatingObject({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.15;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      mouse.current.y * 0.3,
      0.05,
    );
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      mouse.current.x * 0.4,
      0.05,
    );
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.6, 4]} />
        <MeshDistortMaterial
          color="#d9b35a"
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={1.4}
        />
      </mesh>
    </Float>
  );
}

function Wireframe({ mobile }: { mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const count = mobile ? 8 : 14;
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  useFrame((s, d) => {
    if (group.current) group.current.rotation.y += d * 0.05;
  });
  return (
    <group ref={group}>
      {items.map((i) => {
        const r = 3 + (i % 3) * 0.4;
        const angle = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, (i - count / 2) * 0.15, Math.sin(angle) * r]}
          >
            <boxGeometry args={[0.05, 0.05, 0.6]} />
            <meshBasicMaterial color="#d9b35a" transparent opacity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function HeroCanvas() {
  const isMobile = useIsMobile();
  const mouse = useRef({ x: 0, y: 0 });

  return (
    <div
      className="absolute inset-0"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }}
    >
      <Canvas
        dpr={isMobile ? [1, 1.4] : [1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance", alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <FloatingObject mouse={mouse} />
          <Wireframe mobile={isMobile} />
          {!isMobile && <Environment preset="city" />}
        </Suspense>
      </Canvas>
    </div>
  );
}
