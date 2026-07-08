'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial, ContactShadows, Sparkles } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles as SparklesIcon, Hexagon } from 'lucide-react';
import Link from 'next/link';

function FloatingGeometry() {
  const mesh = useRef<any>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x = Math.cos(t / 4) / 2;
      mesh.current.rotation.y = Math.sin(t / 4) / 2;
      mesh.current.rotation.z = Math.sin(t / 1.5) / 2;
      mesh.current.position.y = Math.sin(t / 1.5) / 5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh} castShadow receiveShadow>
        <icosahedronGeometry args={[1.5, 0]} />
        <MeshDistortMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.2}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={0.3}
          speed={2}
          wireframe={true}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#111317']} />
      <fog attach="fog" args={['#111317', 5, 15]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00f0ff" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
      
      <Suspense fallback={null}>
        <FloatingGeometry />
        <Sparkles count={150} scale={12} size={3} speed={0.4} opacity={0.4} color="#00f0ff" />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={15} blur={2.5} far={4} color="#00f0ff" />
        <Environment preset="city" />
      </Suspense>
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.5} 
      />
    </Canvas>
  );
}

export default function LandingPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-bg-obsidian text-text-primary selection:bg-accent/30 font-display">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <Hexagon className="text-accent" strokeWidth={2.5} />
            <span>API<span className="text-text-secondary font-medium">Forge</span></span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link 
              href="/workspace"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-6 glass-panel p-10 md:p-14 rounded-3xl"
          >
            <div className="inline-flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-border-glow bg-bg-overlay/50 text-xs font-mono text-accent mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                Obsidian Glass Engine 1.0
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-text-tertiary">
              Crafting the Digital <br/>
              <span className="text-accent drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">API Experience</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-sans font-light">
              A premium, full-stack API diagnostic platform featuring real-time insights, 
              security posture grading, and a glassmorphic aesthetic built for the modern engineer.
            </p>

            <div className="pt-8 flex items-center justify-center gap-4">
              <Link 
                href="/workspace"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-bg-obsidian font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-glow-cyan"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10">Launch Workspace</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
