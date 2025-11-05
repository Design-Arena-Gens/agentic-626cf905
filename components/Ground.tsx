import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function Ground() {
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#0f3460')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    // Draw grid
    ctx.strokeStyle = '#4834df'
    ctx.lineWidth = 2
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 512)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(512, i)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(10, 10)
    return texture
  }, [])

  // Create platforms
  const platforms = useMemo(() => {
    return [
      { position: [0, 0, 0] as [number, number, number], size: [50, 0.5, 50] as [number, number, number] },
      { position: [10, 2, -10] as [number, number, number], size: [8, 0.5, 8] as [number, number, number] },
      { position: [-12, 3, -15] as [number, number, number], size: [6, 0.5, 6] as [number, number, number] },
      { position: [15, 1.5, -20] as [number, number, number], size: [7, 0.5, 7] as [number, number, number] },
      { position: [-8, 4, 10] as [number, number, number], size: [5, 0.5, 5] as [number, number, number] },
    ]
  }, [])

  return (
    <>
      {/* Main ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[25, 0.25, 25]} position={[0, 0, 0]} />
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[50, 0.5, 50]} />
          <meshStandardMaterial
            map={gridTexture}
            emissive="#16213e"
            emissiveIntensity={0.1}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      </RigidBody>

      {/* Floating platforms */}
      {platforms.slice(1).map((platform, i) => (
        <RigidBody key={i} type="fixed" colliders={false}>
          <CuboidCollider
            args={[platform.size[0] / 2, platform.size[1] / 2, platform.size[2] / 2]}
            position={platform.position}
          />
          <mesh receiveShadow castShadow position={platform.position}>
            <boxGeometry args={platform.size} />
            <meshStandardMaterial
              color="#4834df"
              emissive="#4834df"
              emissiveIntensity={0.3}
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>
          {/* Platform glow */}
          <pointLight
            position={platform.position}
            intensity={2}
            color="#4834df"
            distance={10}
          />
        </RigidBody>
      ))}

      {/* Decorative crystals */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 40
        const z = (Math.random() - 0.5) * 40
        const height = Math.random() * 2 + 1
        const color = ['#ff4757', '#4834df', '#00ffff', '#ffd700'][Math.floor(Math.random() * 4)]

        return (
          <group key={i} position={[x, height / 2 + 0.25, z]}>
            <mesh castShadow>
              <coneGeometry args={[0.3, height, 6]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <pointLight
              position={[0, height / 2, 0]}
              intensity={1}
              color={color}
              distance={5}
            />
          </group>
        )
      })}
    </>
  )
}
