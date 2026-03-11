"use client"

import { useEffect, useRef } from "react"

/**
 * A 2D water simulation rendered via Three.js inside a pill-shaped button.
 * Uses a 1D heightfield with gravity, damping, and mouse-push interaction.
 * The water "sloshes" realistically when the cursor moves over it.
 * Three.js is dynamically imported to avoid adding ~500KB to the initial bundle.
 * Animation only runs while hovered (renders a static frame at rest).
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
const GRAVITY = -0.002  // softer spring toward rest
const DAMPING = 0.996   // high retention → waves persist long after cursor leaves
const SPREAD = 0.12     // gentler wave propagation
const PUSH_RADIUS = 12  // wider, softer area of influence
const PUSH_FORCE = 0.018 // gentle steady push (was 0.08)
const SETTLE_THRESHOLD = 0.0001 // velocity threshold to stop animation

export default function WaterCanvas({
  containerRef,
  isHovered,
  color = "#f59e0b",
  fillLevel = 0.45,
}: WaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    renderer: InstanceType<typeof import("three").WebGLRenderer>
    scene: InstanceType<typeof import("three").Scene>
    camera: InstanceType<typeof import("three").OrthographicCamera>
    geometry: InstanceType<typeof import("three").BufferGeometry>
    material: InstanceType<typeof import("three").ShaderMaterial>
    mesh: InstanceType<typeof import("three").Mesh>
    heights: Float32Array
    velocities: Float32Array
    mouseCol: number
    prevMouseCol: number
    raf: number
    disposed: boolean
    animating: boolean
    startTime: number
  } | null>(null)

  // Setup Three.js scene with dynamic import
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return
    const W = parent.clientWidth
    const H = parent.clientHeight
    if (W === 0 || H === 0) return

    canvas.width = W * 2
    canvas.height = H * 2
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`

    let disposed = false

    // Defer Three.js import until browser is idle to avoid competing with initial paint
    const idleId = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback(() => initThree())
      : setTimeout(() => initThree(), 100) as unknown as number;
    const cancelIdle = typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback : clearTimeout;

    function initThree() {
    if (!canvas) return
    import("three").then((THREE) => {
      if (disposed) return

      const c = new THREE.Color(color)
      const colorVector = new THREE.Vector3(c.r, c.g, c.b)

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

      const positions = new Float32Array(COLS * 2 * 3)
      const indices: number[] = []

      for (let i = 0; i < COLS; i++) {
        const x = i / (COLS - 1)
        positions[(i * 2) * 3 + 0] = x
        positions[(i * 2) * 3 + 1] = 0
        positions[(i * 2) * 3 + 2] = 0
        positions[(i * 2 + 1) * 3 + 0] = x
        positions[(i * 2 + 1) * 3 + 1] = fillLevel
        positions[(i * 2 + 1) * 3 + 2] = 0
        if (i < COLS - 1) {
          const bl = i * 2, tl = i * 2 + 1, br = (i + 1) * 2, tr = (i + 1) * 2 + 1
          indices.push(bl, br, tl, tl, br, tr)
        }
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      geometry.setIndex(indices)

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        uniforms: {
          uColor: { value: colorVector },
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
            float depth = 1.0 - vUv.y;
            float alpha = mix(0.18, 0.65, depth * depth);
            float c1 = sin(vUv.x * 30.0 + uTime * 1.5 + vUv.y * 10.0) * 0.5 + 0.5;
            float c2 = sin(vUv.x * 25.0 - uTime * 1.2 + vUv.y * 15.0 + 2.0) * 0.5 + 0.5;
            float caustic = c1 * c2 * 0.15;
            float surfaceLine = smoothstep(0.02, 0.0, abs(vUv.y - 0.95)) * 0.4;
            float depthGlow = depth * depth * 0.1;
            vec3 col = uColor * (1.0 + caustic + depthGlow) + surfaceLine;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const heights = new Float32Array(COLS).fill(fillLevel)
      const velocities = new Float32Array(COLS).fill(0)

      stateRef.current = {
        renderer, scene, camera, geometry, material, mesh,
        heights, velocities,
        mouseCol: -1, prevMouseCol: -1,
        raf: 0, disposed: false, animating: false,
        startTime: performance.now(),
      }

      // Render one static frame so the water is visible at rest
      renderer.render(scene, camera)
    })
    } // end initThree

    return () => {
      disposed = true
      cancelIdle(idleId)
      if (stateRef.current) {
        stateRef.current.disposed = true
        cancelAnimationFrame(stateRef.current.raf)
        stateRef.current.renderer.dispose()
        stateRef.current.geometry.dispose()
        stateRef.current.material.dispose()
      }
    }
  }, [color, fillLevel])

  // Start/stop animation loop based on hover
  useEffect(() => {
    const s = stateRef.current
    if (!s || s.disposed) return

    const animate = () => {
      if (s.disposed) return

      const elapsed = (performance.now() - s.startTime) / 1000
      s.material.uniforms.uTime.value = elapsed

      const { heights: h, velocities: v } = s
      const n = COLS

      for (let i = 0; i < n; i++) {
        const displacement = h[i] - fillLevel
        v[i] += GRAVITY * displacement * 4
        v[i] *= DAMPING
      }
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < n; i++) {
          if (i > 0) {
            const diff = h[i] - h[i - 1]
            v[i - 1] += diff * SPREAD
            v[i] -= diff * SPREAD
          }
        }
      }

      let maxVel = 0
      for (let i = 0; i < n; i++) {
        h[i] += v[i]
        h[i] = Math.max(0.02, Math.min(0.95, h[i]))
        if (Math.abs(v[i]) > maxVel) maxVel = Math.abs(v[i])
      }

      const pos = s.geometry.attributes.position as { setY(i: number, v: number): void; needsUpdate: boolean }
      for (let i = 0; i < n; i++) {
        pos.setY(i * 2 + 1, h[i])
      }
      pos.needsUpdate = true
      s.renderer.render(s.scene, s.camera)

      // If not hovered and water has settled, stop the loop
      if (!s.animating && maxVel < SETTLE_THRESHOLD) {
        s.raf = 0
        return
      }
      s.raf = requestAnimationFrame(animate)
    }

    if (isHovered) {
      s.animating = true
      if (!s.raf) {
        s.raf = requestAnimationFrame(animate)
      }
    } else {
      // Let physics settle naturally, then stop
      s.animating = false
    }
  }, [isHovered, fillLevel])

  // Mouse interaction
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

      for (let i = -PUSH_RADIUS; i <= PUSH_RADIUS; i++) {
        const ci = s.mouseCol + i
        if (ci >= 0 && ci < COLS) {
          const dist = Math.abs(i) / PUSH_RADIUS
          const falloff = (1 - dist * dist) * (1 - dist * dist)
          s.velocities[ci] -= PUSH_FORCE * falloff
        }
      }
      s.prevMouseCol = s.mouseCol
    }

    const handleEnter = () => {
      const s = stateRef.current
      if (!s) return
      const center = Math.floor(COLS / 2)
      for (let i = -14; i <= 14; i++) {
        const ci = center + i
        if (ci >= 0 && ci < COLS) {
          const t = Math.abs(i) / 14
          const falloff = (1 - t * t) * (1 - t * t)
          s.velocities[ci] -= 0.012 * falloff
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
