"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Points } from "three";
import type { AiStatus } from "@/lib/ai/types";

type JarvisOrbProps = {
  status: AiStatus;
};

export function JarvisOrb({ status }: JarvisOrbProps) {
  return (
    <div className="orb-shell h-[260px] w-full max-w-[460px] sm:h-[350px] xl:h-[430px]">
      <Canvas camera={{ position: [0, 0, 5.9], fov: 52 }}>
        <ambientLight intensity={0.54} />
        <pointLight position={[2, 2, 3]} intensity={2.2} color="#facc15" />
        <pointLight position={[-2, -1, 2]} intensity={1.25} color="#f8fafc" />
        <pointLight position={[0, -2, 3]} intensity={0.9} color="#a1a1aa" />
        <ParticleBrain status={status} />
      </Canvas>
    </div>
  );
}

function ParticleBrain({ status }: JarvisOrbProps) {
  const points = useRef<Points>(null);
  const outerRig = useRef<Group>(null);
  const innerRig = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const count = 1280;
  const scale = status === "listening" ? 1.18 : status === "thinking" ? 1.08 : status === "speaking" ? 1.24 : 1;

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 1.1 + seededUnit(index, 3) * 1.55;
      const theta = seededUnit(index, 7) * Math.PI * 2;
      const phi = Math.acos(2 * seededUnit(index, 11) - 1);
      array[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      array[index * 3 + 2] = radius * Math.cos(phi);
    }

    return array;
  }, []);

  useFrame((_, delta) => {
    if (!points.current) {
      return;
    }

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;
    points.current.rotation.y = elapsed * 0.16;
    points.current.rotation.x = Math.sin(elapsed * 0.24) * 0.18;
    points.current.scale.setScalar(scale + Math.sin(elapsed * 2.1) * 0.025);

    if (outerRig.current) {
      outerRig.current.rotation.z = elapsed * 0.18;
      outerRig.current.rotation.y = elapsed * 0.08;
    }

    if (innerRig.current) {
      innerRig.current.rotation.z = -elapsed * 0.32;
      innerRig.current.rotation.x = Math.sin(elapsed * 0.32) * 0.28;
    }
  });

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.34, 3]} />
        <meshStandardMaterial color="#ca8a04" emissive="#facc15" emissiveIntensity={0.82} transparent opacity={0.18} wireframe />
      </mesh>
      <group ref={outerRig}>
        <mesh>
          <torusGeometry args={[1.72, 0.012, 12, 192]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.55} metalness={0.72} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.3, 0.2]}>
          <torusGeometry args={[2.02, 0.008, 12, 192]} />
          <meshStandardMaterial color="#f8fafc" emissive="#e4e4e7" emissiveIntensity={1.25} metalness={0.85} roughness={0.16} />
        </mesh>
        <mesh rotation={[1.1, 0.7, 0.9]}>
          <torusGeometry args={[2.32, 0.006, 12, 224]} />
          <meshStandardMaterial color="#a1a1aa" emissive="#71717a" emissiveIntensity={1.08} metalness={0.9} roughness={0.18} />
        </mesh>
      </group>
      <group ref={innerRig}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.76, 0.018, 12, 128]} />
          <meshStandardMaterial color="#fff7ed" emissive="#fde68a" emissiveIntensity={1.8} metalness={0.6} roughness={0.16} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.98, 0.01, 12, 128]} />
          <meshStandardMaterial color="#d4d4d8" emissive="#f4f4f5" emissiveIntensity={1.32} metalness={0.86} roughness={0.14} />
        </mesh>
      </group>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#fde68a" size={0.022} sizeAttenuation transparent opacity={0.94} />
      </points>
    </group>
  );
}

function seededUnit(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;

  return value - Math.floor(value);
}
