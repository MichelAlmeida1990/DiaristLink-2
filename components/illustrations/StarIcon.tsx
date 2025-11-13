"use client"

interface StarIconProps {
  className?: string
  size?: number
}

export default function StarIcon({ className = "", size = 48 }: StarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Star */}
      <path
        d="M24 4L28.09 16.26L40 18.18L30 27.14L32.18 39.02L24 33.77L15.82 39.02L18 27.14L8 18.18L19.91 16.26L24 4Z"
        fill="#F1CB5E"
      />
      
      {/* Sparkles */}
      <circle cx="12" cy="12" r="1.5" fill="#FFB156" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="36" cy="12" r="1.5" fill="#FFB156" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="24" cy="36" r="1.5" fill="#F1CB5E" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

