"use client"

interface StepIllustrationProps {
  step: number
  className?: string
  size?: number
}

const stepIcons = {
  1: (
    <g>
      {/* User icon */}
      <circle cx="24" cy="18" r="8" fill="#3B82F6" />
      <path d="M12 36C12 30 16 26 24 26C32 26 36 30 36 36V40H12V36Z" fill="#8B5CF6" />
    </g>
  ),
  2: (
    <g>
      {/* Search icon */}
      <circle cx="20" cy="20" r="8" fill="none" stroke="#8B5CF6" strokeWidth="3" />
      <line x1="28" y1="28" x2="34" y2="34" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
      {/* Location pin */}
      <circle cx="20" cy="20" r="3" fill="#3B82F6" />
    </g>
  ),
  3: (
    <g>
      {/* Chat bubble */}
      <path d="M12 16C12 14.9 12.9 14 14 14H34C35.1 14 36 14.9 36 16V28C36 29.1 35.1 30 34 30H20L12 38V30C10.9 30 10 29.1 10 28V16Z" fill="#8B5CF6" />
      <circle cx="18" cy="22" r="2" fill="white" />
      <circle cx="24" cy="22" r="2" fill="white" />
      <circle cx="30" cy="22" r="2" fill="white" />
    </g>
  ),
  4: (
    <g>
      {/* Checkmark */}
      <circle cx="24" cy="24" r="12" fill="#10B981" />
      <path d="M18 24L22 28L30 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  ),
}

export default function StepIllustration({ step, className = "", size = 64 }: StepIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {stepIcons[step as keyof typeof stepIcons]}
    </svg>
  )
}

