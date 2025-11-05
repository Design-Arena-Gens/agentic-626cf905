import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { Vector3, Mesh, Group } from 'three'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'

export default function Player() {
  const playerRef = useRef<any>(null)
  const groupRef = useRef<Group>(null)
  const [, get] = useKeyboardControls()
  const { addProjectile, takeDamage, useEnergy, energy } = useGameStore()
  const [attackCooldown, setAttackCooldown] = useState(0)
  const [skillCooldown, setSkillCooldown] = useState(0)
  const [ultimateCooldown, setUltimateCooldown] = useState(0)

  const velocity = useRef(new Vector3())
  const direction = useRef(new Vector3())
  const frontVector = useRef(new Vector3())
  const sideVector = useRef(new Vector3())
  const speed = 8
  const jumpForce = 10

  useFrame((state, delta) => {
    if (!playerRef.current) return

    const { forward, backward, left, right, jump, attack, skill, ultimate } = get()

    // Movement
    frontVector.current.set(0, 0, Number(backward) - Number(forward))
    sideVector.current.set(Number(left) - Number(right), 0, 0)
    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed)

    const pos = playerRef.current.translation()

    // Apply movement
    velocity.current.set(direction.current.x, velocity.current.y, direction.current.z)
    playerRef.current.setLinvel(velocity.current, true)

    // Jump
    if (jump && Math.abs(velocity.current.y) < 0.1) {
      velocity.current.y = jumpForce
      playerRef.current.setLinvel(velocity.current, true)
    }

    // Update velocity for next frame
    const linvel = playerRef.current.linvel()
    velocity.current.copy(linvel)

    // Camera follow
    state.camera.position.lerp(
      new Vector3(pos.x, pos.y + 5, pos.z + 10),
      0.1
    )
    state.camera.lookAt(pos.x, pos.y + 2, pos.z)

    // Cooldowns
    if (attackCooldown > 0) setAttackCooldown(attackCooldown - delta)
    if (skillCooldown > 0) setSkillCooldown(skillCooldown - delta)
    if (ultimateCooldown > 0) setUltimateCooldown(ultimateCooldown - delta)

    // Attacks
    if (attack && attackCooldown <= 0 && energy >= 10) {
      useEnergy(10)
      setAttackCooldown(0.3)

      const projectile = {
        id: Math.random(),
        position: new Vector3(pos.x, pos.y + 1, pos.z - 2),
        velocity: new Vector3(0, 0, -30),
        type: 'fire' as const,
        damage: 20,
      }
      addProjectile(projectile)
    }

    if (skill && skillCooldown <= 0 && energy >= 30) {
      useEnergy(30)
      setSkillCooldown(2)

      // Multi-shot attack
      for (let i = -1; i <= 1; i++) {
        const projectile = {
          id: Math.random(),
          position: new Vector3(pos.x + i * 2, pos.y + 1, pos.z - 2),
          velocity: new Vector3(i * 5, 2, -30),
          type: 'ice' as const,
          damage: 35,
        }
        addProjectile(projectile)
      }
    }

    if (ultimate && ultimateCooldown <= 0 && energy >= 50) {
      useEnergy(50)
      setUltimateCooldown(5)

      // Circular explosion
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const projectile = {
          id: Math.random(),
          position: new Vector3(pos.x, pos.y + 2, pos.z),
          velocity: new Vector3(Math.sin(angle) * 20, 3, Math.cos(angle) * 20),
          type: 'lightning' as const,
          damage: 50,
        }
        addProjectile(projectile)
      }
    }

    // Rotate player mesh based on movement
    if (groupRef.current && direction.current.length() > 0) {
      const angle = Math.atan2(direction.current.x, direction.current.z)
      groupRef.current.rotation.y = angle
    }
  })

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 3, 0]}
      enabledRotations={[false, false, false]}
      linearDamping={2}
    >
      <CapsuleCollider args={[0.75, 0.5]} />
      <group ref={groupRef}>
        {/* Character body */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.5, 1.5, 16, 32]} />
          <meshStandardMaterial
            color="#4834df"
            emissive="#4834df"
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 2, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Weapon - Glowing sword */}
        <mesh castShadow position={[0.7, 1, -0.5]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 2, 0.3]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0.1}
          />
        </mesh>

        {/* Aura effect */}
        <pointLight position={[0, 1, 0]} intensity={2} color="#4834df" distance={5} />
      </group>
    </RigidBody>
  )
}
