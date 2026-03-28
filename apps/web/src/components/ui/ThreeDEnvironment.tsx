"use client";

import { useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Stars,
  Clouds,
  Cloud,
  Float,
  MeshDistortMaterial,
} from "@react-three/drei";
import { Sun, Moon, Sunrise, Sunset } from "lucide-react";

type TimeTheme = "sunrise" | "day" | "sunset" | "night";

// Dynamic Theme Scenes
function NightScene() {
  return (
    <>
      <color attach="background" args={["#09090b"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} color="#7c3aed" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#f97316" intensity={0.5} />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      {/* A faint glowing abstract nebula orb */}
      <Float speed={2} floatIntensity={1} rotationIntensity={1}>
        <mesh position={[0, 0, -20]}>
          <sphereGeometry args={[10, 64, 64]} />
          <MeshDistortMaterial
            color="#7c3aed"
            emissive="#4c1d95"
            emissiveIntensity={2}
            distort={0.4}
            speed={1.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
    </>
  );
}

function SunsetScene() {
  return (
    <>
      <color attach="background" args={["#2e1065"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, -10]} color="#f97316" intensity={2} />
      {/* The big sunset orb */}
      <mesh position={[0, -5, -20]}>
        <sphereGeometry args={[12, 64, 64]} />
        <meshBasicMaterial color="#ea580c" />
      </mesh>
      {/* Clouds */}
      <Clouds>
        <Cloud
          position={[-10, 0, -15]}
          speed={0.2}
          opacity={0.5}
          color="#be123c"
        />
        <Cloud
          position={[10, 2, -10]}
          speed={0.2}
          opacity={0.4}
          color="#f97316"
        />
      </Clouds>
    </>
  );
}

function SunriseScene() {
  return (
    <>
      <color attach="background" args={["#4c1d95"]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, -5, -10]} color="#fcd34d" intensity={3} />
      <Clouds>
        <Cloud
          position={[0, -5, -15]}
          speed={0.2}
          opacity={0.6}
          color="#fb7185"
        />
      </Clouds>
      <Float speed={1} floatIntensity={2}>
        <mesh position={[0, -2, -20]}>
          <sphereGeometry args={[8, 64, 64]} />
          <meshBasicMaterial color="#fcd34d" />
        </mesh>
      </Float>
    </>
  );
}

function DayScene() {
  return (
    <>
      <color attach="background" args={["#0f172a"]} />{" "}
      {/* Very dark blue, matching site theme */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 20, 10]} color="#38bdf8" intensity={2} />
      {/* Abstract day shape */}
      <Float speed={2} floatIntensity={1.5} rotationIntensity={0.5}>
        <mesh position={[0, 5, -15]}>
          <icosahedronGeometry args={[5, 1]} />
          <MeshDistortMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1}
            distort={0.2}
            speed={2}
            transparent
            opacity={0.6}
            wireframe
          />
        </mesh>
      </Float>
      <Clouds>
        <Cloud
          position={[-5, 5, -20]}
          speed={0.5}
          opacity={0.2}
          color="#ffffff"
        />
        <Cloud
          position={[10, 0, -10]}
          speed={0.4}
          opacity={0.1}
          color="#38bdf8"
        />
      </Clouds>
    </>
  );
}

export function ThreeDEnvironment() {
  const [theme, setTheme] = useState<TimeTheme>("night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-detect time initially
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) setTheme("sunrise");
    else if (hour >= 9 && hour < 17) setTheme("day");
    else if (hour >= 17 && hour < 20) setTheme("sunset");
    else setTheme("night");
  }, []);

  if (!mounted) return <div className="absolute inset-0 z-0 bg-[#09090b]" />;

  const getButtonClass = (isActive: boolean, activeStyles: string) => {
    return (
      "flex items-center justify-center rounded-full p-2.5 transition-all " +
      (isActive ? activeStyles : "text-slate-400 hover:text-white")
    );
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b]">
      {/* The 3D Canvas */}
      <div className="absolute inset-0 opacity-80 mix-blend-screen">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Suspense fallback={null}>
            {theme === "night" && <NightScene />}
            {theme === "sunset" && <SunsetScene />}
            {theme === "sunrise" && <SunriseScene />}
            {theme === "day" && <DayScene />}
          </Suspense>
        </Canvas>
      </div>

      {/* Persistent global blend to ensuring text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/30 via-[#09090b]/60 to-[#09090b]" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay" />

      {/* Mood Selector UI overlaying the background */}
      <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur-xl">
        <button
          onClick={() => setTheme("sunrise")}
          className={getButtonClass(
            theme === "sunrise",
            "bg-[#ea580c]/20 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.3)]",
          )}
          title="Gün Doğumu"
        >
          <Sunrise className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme("day")}
          className={getButtonClass(
            theme === "day",
            "bg-[#38bdf8]/20 text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.3)]",
          )}
          title="Gündüz"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme("sunset")}
          className={getButtonClass(
            theme === "sunset",
            "bg-[#be123c]/20 text-[#be123c] shadow-[0_0_15px_rgba(190,18,60,0.3)]",
          )}
          title="Gün Batımı"
        >
          <Sunset className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme("night")}
          className={getButtonClass(
            theme === "night",
            "bg-[#7c3aed]/20 text-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.3)]",
          )}
          title="Gece"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
