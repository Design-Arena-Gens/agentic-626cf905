import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'

function Projectile({ projectile }: { projectile: any }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Points>(null)
  const { removeProjectile } = useGameStore()
  const lifeTime = useRef(0)

  const color = useMemo(() => {
    switch (projectile.type) {
      case 'fire': return '#ff4757'
      case 'ice': return '#00ffff'
      case 'lightning': return '#ffd700'
      default: return '#ffffff'
    }
  }, [projectile.type])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Update position
    projectile.position.add(projectile.velocity.clone().multiplyScalar(delta))
    meshRef.current.position.copy(projectile.position)

    // Rotation animation
    meshRef.current.rotation.x += delta * 10
    meshRef.current.rotation.y += delta * 15

    // Remove after 3 seconds
    lifeTime.current += delta
    if (lifeTime.current > 3) {
      removeProjectile(projectile.id)
    }

    // Scale pulse
    const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2
    meshRef.current.scale.setScalar(scale)
  })

  const geometry = useMemo(() => {
    switch (projectile.type) {
      case 'fire':
        return <octahedronGeometry args={[0.3, 0]} />
      case 'ice':
        return <tetrahedronGeometry args={[0.35, 0]} />
      case 'lightning':
        return <dodecahedronGeometry args={[0.25, 0]} />
      default:
        return <sphereGeometry args={[0.3, 16, 16]} />
    }
  }, [projectile.type])

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        position={projectile.position.toArray()}
        intensity={3}
        color={color}
        distance={8}
      />
    </group>
  )
}

export default function Particles() {
  const { projectiles } = useGameStore()

  // Ambient particles
  const ambientParticles = useMemo(() => {
    const positions = new Float32Array(200 * 3)
    const colors = new Float32Array(200 * 3)

    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = Math.random() * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50

      const color = new THREE.Color()
      color.setHSL(Math.random(), 0.8, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, colors }
  }, [])

  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (!particlesRef.current) return

    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      {projectiles.map((projectile) => (
        <Projectile key={projectile.id} projectile={projectile} />
      ))}

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={ambientParticles.positions.length / 3}
            array={ambientParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={ambientParticles.colors.length / 3}
            array={ambientParticles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  )
}
