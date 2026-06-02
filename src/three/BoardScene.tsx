import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useBoardStore } from '../store'
import { PEDAL_MAP } from '../engine/registry'

const PEDAL_W = 1.4
const PEDAL_H = 0.55
const PEDAL_D = 2.0
const SPACING = 0.25

function PedalMesh({
  defId,
  color,
  bypass,
  name,
  index,
  total,
}: {
  defId: string
  color: string
  bypass: boolean
  name: string
  index: number
  total: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const totalWidth = total * (PEDAL_W + SPACING) - SPACING
  const x = -totalWidth / 2 + index * (PEDAL_W + SPACING) + PEDAL_W / 2

  useFrame(({ clock }) => {
    if (meshRef.current && !bypass) {
      meshRef.current.position.y = Math.sin(clock.elapsedTime * 1.2 + index) * 0.015
    }
  })

  const c = new THREE.Color(color)
  const bypassedColor = new THREE.Color('#333')

  return (
    <group position={[x, 0, 0]}>
      {/* Pedal enclosure */}
      <RoundedBox
        ref={meshRef}
        args={[PEDAL_W, PEDAL_H, PEDAL_D]}
        radius={0.06}
        smoothness={4}
      >
        <meshStandardMaterial
          color={bypass ? bypassedColor : c}
          roughness={0.6}
          metalness={0.3}
          opacity={bypass ? 0.5 : 1}
          transparent={bypass}
        />
      </RoundedBox>

      {/* Label */}
      <Text
        position={[0, PEDAL_H / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.18}
        color={bypass ? '#555' : '#fff'}
        anchorX="center"
        anchorY="middle"
        maxWidth={PEDAL_W * 0.9}
      >
        {name}
      </Text>

      {/* Knob domes (decorative) */}
      {[- 0.35, 0, 0.35].map((kx, ki) => (
        <mesh key={ki} position={[kx, PEDAL_H / 2 + 0.04, 0.3]}>
          <sphereGeometry args={[0.08, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}

      {/* Status LED */}
      <mesh position={[0.4, PEDAL_H / 2 + 0.04, -0.7]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={bypass ? '#330000' : '#ff2020'}
          emissive={bypass ? new THREE.Color('#000') : new THREE.Color('#ff0000')}
          emissiveIntensity={bypass ? 0 : 1.5}
        />
      </mesh>
    </group>
  )
}

function Cables({ count }: { count: number }) {
  if (count < 2) return null
  const totalWidth = count * (PEDAL_W + SPACING) - SPACING
  const cables: React.ReactNode[] = []

  for (let i = 0; i < count - 1; i++) {
    const x1 = -totalWidth / 2 + i * (PEDAL_W + SPACING) + PEDAL_W
    const x2 = x1 + SPACING + 0.01
    const midX = (x1 + x2) / 2
    const points = [
      new THREE.Vector3(x1, 0.01, 0.6),
      new THREE.Vector3(midX, -0.15, 0.6),
      new THREE.Vector3(x2, 0.01, 0.6),
    ]
    const curve = new THREE.CatmullRomCurve3(points)
    const tubePoints = curve.getPoints(20)
    const geo = new THREE.TubeGeometry(curve, 20, 0.018, 6, false)
    cables.push(
      <mesh key={i} geometry={geo}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
    )
  }

  return <>{cables}</>
}

function Board() {
  const { pedals } = useBoardStore()

  return (
    <>
      {/* Pedalboard surface */}
      <mesh position={[0, -PEDAL_H / 2 - 0.02, 0]} receiveShadow>
        <boxGeometry args={[
          Math.max(5, pedals.length * (PEDAL_W + SPACING) + 1),
          0.08,
          3.4
        ]} />
        <meshStandardMaterial color="#1c1008" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Velcro texture strips */}
      {[-0.7, 0.7].map((z, i) => (
        <mesh key={i} position={[0, -PEDAL_H / 2 + 0.002, z]} receiveShadow>
          <boxGeometry args={[
            Math.max(5, pedals.length * (PEDAL_W + SPACING) + 1),
            0.01,
            0.25
          ]} />
          <meshStandardMaterial color="#2a1a0a" roughness={1} />
        </mesh>
      ))}

      {pedals.map((p, i) => {
        const def = PEDAL_MAP[p.defId]
        return (
          <PedalMesh
            key={p.uid}
            defId={p.defId}
            color={def?.color ?? '#555'}
            bypass={p.bypass}
            name={def?.name ?? p.defId}
            index={i}
            total={pedals.length}
          />
        )
      })}

      <Cables count={pedals.length} />
    </>
  )
}

export function BoardScene() {
  return (
    <div className="board-scene">
      <Canvas
        camera={{ position: [0, 2.5, 4], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          castShadow
        />
        <pointLight position={[-2, 3, -1]} intensity={0.4} color="#ffe0a0" />
        <Board />
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  )
}
