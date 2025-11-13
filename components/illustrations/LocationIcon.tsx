"use client"

interface LocationIconProps {
  className?: string
  size?: number
}

export default function LocationIcon({ className = "", size = 48 }: LocationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pulsing circle */}
      <circle cx="24" cy="24" r="20" fill="#3B82F6" opacity="0.2">
        <animate
          attributeName="r"
          values="20;24;20"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.2;0.1;0.2"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Pin */}
      <path
        d="M24 4C16.27 4 10 10.27 10 18C10 28 24 44 24 44C24 44 38 28 38 18C38 10.27 31.73 4 24 4Z"
        fill="#3B82F6"
      />
      <circle cx="24" cy="18" r="6" fill="white" />
    </svg>
  )
}

