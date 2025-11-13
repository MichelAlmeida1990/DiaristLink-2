"use client"

interface ChatIconProps {
  className?: string
  size?: number
}

export default function ChatIcon({ className = "", size = 48 }: ChatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Chat bubble */}
      <path
        d="M8 8C8 5.79 9.79 4 12 4H36C38.21 4 40 5.79 40 8V28C40 30.21 38.21 32 36 32H20L12 40V32C9.79 32 8 30.21 8 28V8Z"
        fill="#8B5CF6"
      />
      
      {/* Message dots */}
      <circle cx="16" cy="18" r="2" fill="white">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="24" cy="18" r="2" fill="white">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="32" cy="18" r="2" fill="white">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

