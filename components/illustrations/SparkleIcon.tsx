"use client"

interface SparkleIconProps {
  className?: string
  size?: number
  color?: string
}

export default function SparkleIcon({ className = "", size = 24, color = "#FFB156" }: SparkleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill={color}
        opacity="0.9"
      >
        <animate
          attributeName="opacity"
          values="0.9;0.3;0.9"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.6">
        <animate
          attributeName="r"
          values="2;3;2"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}

