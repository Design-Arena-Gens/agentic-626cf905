import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Vector3 } from 'three'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'

function Enemy({ position, id }: { position: [number, number, number], id: number }) {
  const enemyRef = useRef<any>(null)
  const meshRef = useRef<THREE.Group>(null)
  const { removeEnemy, projectiles, addCombo } = useGameStore()
  const healthRef = useRef(100)

  useFrame((state) => {
    if (!enemyRef.current || !meshRef.current) return

    // Simple AI - move toward origin (player spawn)
    const pos = enemyRef.current.translation()
    const targetPos = new Vector3(0, pos.y, 0)
    const direction = targetPos.sub(new Vector3(pos.x, pos.y, pos.z)).normalize()

    const velocity = new Vector3(direction.x * 2, enemyRef.current.linvel().y, direction.z * 2)
    enemyRef.current.setLinvel(velocity, true)

    // Rotate to face movement direction
    if (direction.length() > 0) {
      const angle = Math.atan2(direction.x, direction.z)
      meshRef.current.rotation.y = angle
    }

    // Bob animation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1

    // Check collision with projectiles
    projectiles.forEach((projectile) => {
      const projectilePos = projectile.position
      const distance = Math.sqrt(
        Math.pow(projectilePos.x - pos.x, 2) +
        Math.pow(projectilePos.y - pos.y, 2) +
        Math.pow(projectilePos.z - pos.z, 2)
      )

      if (distance < 1.5) {
        healthRef.current -= projectile.damage
        if (healthRef.current <= 0) {
          removeEnemy(id)
          addCombo()
        }
      }
    })
  })

  const color = useMemo(() => {
    const colors = ['#ff4757', '#ff6348', '#ff7675', '#fd79a8']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  return (
    <RigidBody
      ref={enemyRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={position}
      enabledRotations={[false, true, false]}
      linearDamping={1}
    >
      <CuboidCollider args={[0.6, 0.6, 0.6]} />
      <group ref={meshRef}>
        {/* Enemy body */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>

        {/* Enemy spikes */}
        {[0, 90, 180, 270].map((angle, i) => (
          <mesh
            key={i}
            castShadow
            position={[
              Math.sin((angle * Math.PI) / 180) * 0.8,
              0,
              Math.cos((angle * Math.PI) / 180) * 0.8,
            ]}
            rotation={[0, (angle * Math.PI) / 180, 0]}
          >
            <coneGeometry args={[0.2, 0.6, 4]} />
            <meshStandardMaterial
              color="#000000"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}

        {/* Enemy glow */}
        <pointLight intensity={1.5} color={color} distance={5} />
      </group>
    </RigidBody>
  )
}

export default function Enemies() {
  const { enemies } = useGameStore()

  return (
    <>
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} position={enemy.position} id={enemy.id} />
      ))}
    </>
  )
}
