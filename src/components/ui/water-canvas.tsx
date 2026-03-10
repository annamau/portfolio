"use client"

import { useEffect, useRef, useCallback } from "react"
import * as THREE from "three"

/**
 * A 2D water simulation rendered via Three.js inside a pill-shaped button.
 * Uses a 1D heightfield with gravity, damping, and mouse-push interaction.
 * The water "sloshes" realistically when the cursor moves over it.
 */
interface WaterCanvasProps {
  /** Container element to track mouse relative to */
  containerRef: React.RefObject<HTMLElement | null>
  isHovered: boolean
  /** Base color for the water — uses amber/gold to match theme */
  color?: string
  /** How full the glass is, 0–1. Default 0.45 */
  fillLevel?: number
}

// Simulation constants
const COLS = 80         // horizontal resolution of the heightfield
const GRAVITY = -0.004  // downward pull per tick
const DAMPING = 0.982   // velocity retention per tick
const SPREAD = 0.18     // how fast waves propagate between columns
const PUSH_RADIUS = 10  // columns affected by cursor push
const PUSH_FORCE = 0.08 // force applied per hover frame

export default function WaterCanvas({
  containerRef,
  isHovered,
  color = "#f59e0b",
  fillLevel = 0.45,
}: WaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    geometry: THREE.BufferGeometry
    material: THREE.ShaderMaterial
    mesh: THREE.Mesh
    heights: Float32Array
    velocities: Float32Array
    mouseCol: number
    prevMouseCol: number
    raf: number
    disposed: boolean
  } | null>(null)

  // Convert hex to vec3 for shader
  const colorVec = useCallback(() => {
    const c = new THREE.Color(color)
    return new THREE.Vector3(c.r, c.g, c.b)
  }, [color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Use parent size
    const parent = canvas.parentElement
    if (!parent) return
    const W = parent.clientWidth
    const H = parent.clientHeight
    if (W === 0 || H === 0) return

    canvas.width = W * 2  // retina
    canvas.height = H * 2
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`

    // ─── Three.js setup ───
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(2)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1)

    // Build a quad strip for the water body
    // Each column has a top vertex (moves) and bottom vertex (fixed at 0)
    const positions = new Float32Array(COLS * 2 * 3) // COLS * 2 vertices * 3 components
    const indices: number[] = []

    for (let i = 0; i < COLS; i++) {
      const x = i / (COLS - 1)
      // bottom vertex
      positions[(i * 2) * 3 + 0] = x
      positions[(i * 2) * 3 + 1] = 0
      positions[(i * 2) * 3 + 2] = 0
      // top vertex (will be updated each frame)
      positions[(i * 2 + 1) * 3 + 0] = x
      positions[(i * 2 + 1) * 3 + 1] = fillLevel
      positions[(i * 2 + 1) * 3 + 2] = 0

      if (i < COLS - 1) {
        const bl = i * 2
        const tl = i * 2 + 1
        const br = (i + 1) * 2
        const tr = (i + 1) * 2 + 1
        indices.push(bl, br, tl)
        indices.push(tl, br, tr)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setIndex(indices)

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      uniforms: {
        uColor: { value: colorVec() },
        uFillLevel: { value: fillLevel },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float uFillLevel;
        void main() {
          vUv = vec2(position.x, position.y / max(uFillLevel * 1.8, 0.01));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uFillLevel;
        uniform float uTime;
        void main() {
          // Depth-based opacity — much more visible
          float depth = 1.0 - vUv.y;
          float alpha = mix(0.18, 0.65, depth * depth);
          // Animated caustic pattern
          float c1 = sin(vUv.x * 30.0 + uTime * 1.5 + vUv.y * 10.0) * 0.5 + 0.5;
          float c2 = sin(vUv.x * 25.0 - uTime * 1.2 + vUv.y * 15.0 + 2.0) * 0.5 + 0.5;
          float caustic = c1 * c2 * 0.15;
          // Surface highlight — bright line at water top
          float surfaceLine = smoothstep(0.02, 0.0, abs(vUv.y - 0.95)) * 0.4;
          // Depth glow near bottom
          float depthGlow = depth * depth * 0.1;
          vec3 col = uColor * (1.0 + caustic + depthGlow) + surfaceLine;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Simulation arrays
    const heights = new Float32Array(COLS).fill(fillLevel)
    const velocities = new Float32Array(COLS).fill(0)

    stateRef.current = {
      renderer,
      scene,
      camera,
      geometry,
      material,
      mesh,
      heights,
      velocities,
      mouseCol: -1,
      prevMouseCol: -1,
      raf: 0,
      disposed: false,
    }

    // ─── Animation loop ───
    let startTime = performance.now()
    const animate = () => {
      const s = stateRef.current
      if (!s || s.disposed) return

      // Update time uniform for caustic animation
      const elapsed = (performance.now() - startTime) / 1000
      s.material.uniforms.uTime.value = elapsed

      const { heights: h, velocities: v } = s
      const n = COLS

      // 1. Apply gravity toward fill level (spring to rest)
      for (let i = 0; i < n; i++) {
        const displacement = h[i] - fillLevel
        v[i] += GRAVITY * displacement * 8 // spring force
        v[i] *= DAMPING
      }

      // 2. Wave propagation (multiple passes for stability)
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < n; i++) {
          if (i > 0) {
            const diff = h[i] - h[i - 1]
            v[i - 1] += diff * SPREAD
            v[i] -= diff * SPREAD
          }
        }
      }

      // 3. Apply velocities
      for (let i = 0; i < n; i++) {
        h[i] += v[i]
        // Clamp within glass
        h[i] = Math.max(0.02, Math.min(0.95, h[i]))
      }

      // 4. Update geometry
      const pos = s.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < n; i++) {
        pos.setY(i * 2 + 1, h[i])
      }
      pos.needsUpdate = true

      // 5. Render
      s.renderer.render(s.scene, s.camera)
      s.raf = requestAnimationFrame(animate)
    }

    stateRef.current.raf = requestAnimationFrame(animate)

    return () => {
      if (stateRef.current) {
        stateRef.current.disposed = true
        cancelAnimationFrame(stateRef.current.raf)
        renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [colorVec, fillLevel])

  // ─── Mouse interaction ───
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMove = (e: MouseEvent) => {
      const s = stateRef.current
      if (!s) return
      const rect = container.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width
      const col = Math.floor(relX * COLS)
      s.mouseCol = Math.max(0, Math.min(COLS - 1, col))

      // Push the water down where cursor is (like poking the surface)
      const relY = (e.clientY - rect.top) / rect.height
      // Only push if cursor is in the upper area (near water surface)
      for (let i = -PUSH_RADIUS; i <= PUSH_RADIUS; i++) {
        const ci = s.mouseCol + i
        if (ci >= 0 && ci < COLS) {
          const dist = Math.abs(i) / PUSH_RADIUS
          const falloff = 1 - dist * dist // quadratic falloff
          // Push water away from cursor — down if above surface, sideways displacement
          const pushDir = relY < 0.6 ? -1 : 1
          s.velocities[ci] += pushDir * PUSH_FORCE * falloff
        }
      }
      s.prevMouseCol = s.mouseCol
    }

    const handleEnter = () => {
      const s = stateRef.current
      if (!s) return
      // Initial splash — drop water level at center then release
      const center = Math.floor(COLS / 2)
      for (let i = -12; i <= 12; i++) {
        const ci = center + i
        if (ci >= 0 && ci < COLS) {
          const falloff = 1 - Math.abs(i) / 12
          s.velocities[ci] -= 0.04 * falloff
        }
      }
    }

    container.addEventListener("mousemove", handleMove)
    container.addEventListener("mouseenter", handleEnter)

    return () => {
      container.removeEventListener("mousemove", handleMove)
      container.removeEventListener("mouseenter", handleEnter)
    }
  }, [containerRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
