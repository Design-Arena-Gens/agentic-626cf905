import { create } from 'zustand'
import { Vector3 } from 'three'

interface Projectile {
  id: number
  position: Vector3
  velocity: Vector3
  type: 'fire' | 'ice' | 'lightning'
  damage: number
}

interface Enemy {
  id: number
  position: [number, number, number]
  health: number
}

interface GameState {
  health: number
  energy: number
  combo: number
  projectiles: Projectile[]
  enemies: Enemy[]
  score: number

  takeDamage: (amount: number) => void
  useEnergy: (amount: number) => void
  addProjectile: (projectile: Projectile) => void
  removeProjectile: (id: number) => void
  addEnemy: (enemy: Enemy) => void
  removeEnemy: (id: number) => void
  addCombo: () => void
  resetCombo: () => void
}

export const useGameStore = create<GameState>((set, get) => {
  // Spawn initial enemies
  const initialEnemies: Enemy[] = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 40,
      3,
      (Math.random() - 0.5) * 40 - 20,
    ] as [number, number, number],
    health: 100,
  }))

  // Enemy spawner
  let enemyIdCounter = initialEnemies.length
  setInterval(() => {
    const state = get()
    if (state.enemies.length < 15) {
      const angle = Math.random() * Math.PI * 2
      const distance = 30 + Math.random() * 10
      set({
        enemies: [
          ...state.enemies,
          {
            id: enemyIdCounter++,
            position: [
              Math.sin(angle) * distance,
              3,
              Math.cos(angle) * distance,
            ] as [number, number, number],
            health: 100,
          },
        ],
      })
    }
  }, 3000)

  // Energy regeneration
  setInterval(() => {
    const state = get()
    if (state.energy < 100) {
      set({ energy: Math.min(100, state.energy + 1) })
    }
  }, 100)

  // Combo reset
  let comboTimer: NodeJS.Timeout | null = null

  return {
    health: 100,
    energy: 100,
    combo: 0,
    projectiles: [],
    enemies: initialEnemies,
    score: 0,

    takeDamage: (amount) =>
      set((state) => ({
        health: Math.max(0, state.health - amount),
      })),

    useEnergy: (amount) =>
      set((state) => ({
        energy: Math.max(0, state.energy - amount),
      })),

    addProjectile: (projectile) =>
      set((state) => ({
        projectiles: [...state.projectiles, projectile],
      })),

    removeProjectile: (id) =>
      set((state) => ({
        projectiles: state.projectiles.filter((p) => p.id !== id),
      })),

    addEnemy: (enemy) =>
      set((state) => ({
        enemies: [...state.enemies, enemy],
      })),

    removeEnemy: (id) =>
      set((state) => ({
        enemies: state.enemies.filter((e) => e.id !== id),
        score: state.score + 100,
      })),

    addCombo: () => {
      if (comboTimer) clearTimeout(comboTimer)

      set((state) => ({ combo: state.combo + 1 }))

      comboTimer = setTimeout(() => {
        set({ combo: 0 })
      }, 3000)
    },

    resetCombo: () => set({ combo: 0 }),
  }
})
