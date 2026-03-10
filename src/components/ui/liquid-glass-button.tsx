"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const WaterCanvas = dynamic(() => import("./water-canvas"), { ssr: false })

/* ─── shared size/variant cva ─── */
const liquidbuttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default: "text-primary",
        destructive: "text-white",
        outline: "text-accent-foreground",
        secondary: "text-secondary-foreground",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 text-xs gap-1.5 px-4",
        lg: "h-10 px-6",
        xl: "h-12 px-8",
        xxl: "h-14 px-10",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xxl",
    },
  }
)

type SharedProps = React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean
  }

/* Glass inset-shadow classes (shared between both buttons) */
const glassShadow =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. LiquidButton — clear frosted glass + ink follow
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LiquidButton({ className, variant, size, asChild = false, children, ...props }: SharedProps) {
  const wrapperRef = React.useRef<HTMLElement>(null)
  const inkRef = React.useRef<HTMLDivElement>(null)
  const [isPressed, setIsPressed] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!wrapperRef.current || !inkRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    inkRef.current.style.setProperty("--ink-x", `${e.clientX - rect.left}px`)
    inkRef.current.style.setProperty("--ink-y", `${e.clientY - rect.top}px`)
  }, [])

  const childElement = asChild
    ? (React.Children.only(children) as React.ReactElement<Record<string, unknown>>)
    : null
  const innerContent = (asChild ? childElement?.props?.children : children) as React.ReactNode

  const inner = (
    <>
      <div className={cn("absolute inset-0 rounded-full pointer-events-none transition-shadow duration-300", glassShadow)} />

      {/* Real glass backdrop blur */}
      <div className="absolute inset-0 isolate overflow-hidden rounded-full pointer-events-none"
        style={{
          backdropFilter: "blur(16px) saturate(1.4) brightness(1.05)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4) brightness(1.05)",
          background: "rgba(255,255,255,0.04)",
        }}
      />

      {/* Glass top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-[45%] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
          borderRadius: "inherit",
        }}
      />

      {/* Bottom glass edge refraction */}
      <div
        className="absolute inset-x-0 bottom-0 h-[20%] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(0deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
          borderRadius: "inherit",
        }}
      />

      {/* Glass border */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "inherit",
        }}
      />

      {/* Ink blob follows cursor */}
      <div ref={inkRef} className="absolute inset-0 rounded-full overflow-hidden pointer-events-none" style={{ "--ink-x": "50%", "--ink-y": "50%" } as React.CSSProperties}>
        <div
          className="absolute rounded-full"
          style={{
            width: isHovered ? 140 : 0,
            height: isHovered ? 140 : 0,
            left: "var(--ink-x)",
            top: "var(--ink-y)",
            transform: `translate(-50%, -50%) scale(${isPressed ? 1.6 : 1})`,
            background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.06) 40%, transparent 70%)",
            filter: "blur(6px)",
            transition: isHovered
              ? "width 0.5s cubic-bezier(0.16,1,0.3,1), height 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.15s ease-out"
              : "width 0.4s ease, height 0.4s ease, transform 0.15s ease-out",
          }}
        />
      </div>

      {/* Hover edge glow */}
      <div className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300" style={{ opacity: isHovered ? 1 : 0, boxShadow: "inset 0 0 12px 2px rgba(245,158,11,0.08), 0 0 20px 2px rgba(245,158,11,0.06)" }} />

      <span className="relative z-10 flex items-center gap-2 transition-transform duration-150 ease-out" style={{ transform: isPressed ? "scale(0.95)" : "scale(1)" }}>
        {innerContent}
      </span>
    </>
  )

  return renderShell({
    asChild, childElement, props, inner, isPressed, isHovered, wrapperRef, className,
    variant, size,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => { setIsHovered(false); setIsPressed(false) },
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
    },
  })
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. WaveButton — Three.js water simulation inside glass
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function WaveButton({ className, variant, size, asChild = false, children, ...props }: SharedProps) {
  const wrapperRef = React.useRef<HTMLElement>(null)
  const [isPressed, setIsPressed] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const childElement = asChild
    ? (React.Children.only(children) as React.ReactElement<Record<string, unknown>>)
    : null
  const innerContent = (asChild ? childElement?.props?.children : children) as React.ReactNode

  const inner = (
    <>
      {/* Glass container shadow */}
      <div className={cn("absolute inset-0 rounded-full pointer-events-none transition-shadow duration-300", glassShadow)} />

      {/* Glass distortion backdrop */}
      <div className="absolute inset-0 isolate overflow-hidden rounded-full pointer-events-none"
        style={{
          backdropFilter: "blur(12px) saturate(1.2)",
          WebkitBackdropFilter: "blur(12px) saturate(1.2)",
          background: "rgba(255,255,255,0.03)",
        }}
      />

      {/* Three.js water simulation */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <WaterCanvas
          containerRef={wrapperRef}
          isHovered={isHovered}
          color="#f59e0b"
          fillLevel={0.55}
        />
      </div>

      {/* Glass reflections — top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-[40%] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)",
          borderRadius: "inherit",
        }}
      />

      {/* Glass edge highlights */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0.5,
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -1px 1px rgba(0,0,0,0.08)",
        }}
      />

      <span className="relative z-10 flex items-center gap-2 transition-transform duration-150 ease-out" style={{ transform: isPressed ? "scale(0.95)" : "scale(1)" }}>
        {innerContent}
      </span>
    </>
  )

  return renderShell({
    asChild, childElement, props, inner, isPressed, isHovered, wrapperRef, className,
    variant, size,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => { setIsHovered(false); setIsPressed(false) },
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
    },
  })
}

/* ─── shared render helper ─── */

function renderShell({
  asChild, childElement, props, inner, isPressed, isHovered, wrapperRef, className, variant, size, handlers,
}: {
  asChild: boolean
  childElement: React.ReactElement<Record<string, unknown>> | null
  props: Record<string, unknown>
  inner: React.ReactNode
  isPressed: boolean
  isHovered: boolean
  wrapperRef: React.RefObject<HTMLElement | null>
  className?: string
  variant?: SharedProps["variant"]
  size?: SharedProps["size"]
  handlers: Record<string, unknown>
}) {
  const setRef = (el: HTMLElement | null) => {
    (wrapperRef as React.MutableRefObject<HTMLElement | null>).current = el
  }

  const sharedClassName = cn("relative overflow-hidden", liquidbuttonVariants({ variant, size, className }))
  const transformStyle = {
    transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease",
    transform: isPressed ? "scale(0.97)" : isHovered ? "scale(1.03)" : "scale(1)",
  }

  if (asChild && childElement) {
    return React.createElement(
      childElement.type as string,
      {
        ...childElement.props,
        ...props,
        ...handlers,
        ref: setRef,
        className: cn(sharedClassName, childElement.props?.className as string),
        style: {
          ...(typeof childElement.props?.style === "object" ? childElement.props.style : {}),
          ...(typeof props.style === "object" ? props.style : {}),
          ...transformStyle,
        },
      },
      inner
    )
  }

  return (
    <button
      data-slot="button"
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      {...(handlers as React.DOMAttributes<HTMLButtonElement>)}
      ref={setRef as React.Ref<HTMLButtonElement>}
      className={sharedClassName}
      style={{ ...(typeof props.style === "object" ? (props.style as React.CSSProperties) : {}), ...transformStyle }}
    >
      {inner}
    </button>
  )
}

export { LiquidButton, WaveButton, liquidbuttonVariants }
