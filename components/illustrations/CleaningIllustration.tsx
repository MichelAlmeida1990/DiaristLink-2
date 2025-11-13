"use client"

interface CleaningIllustrationProps {
  className?: string
  size?: number
}

export default function CleaningIllustration({ className = "", size = 200 }: CleaningIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle glow */}
      <circle cx="100" cy="100" r="80" fill="#3B82F6" opacity="0.1" />
      
      {/* Person head */}
      <circle cx="100" cy="70" r="22" fill="#3B82F6" />
      <circle cx="95" cy="67" r="3" fill="white" opacity="0.8" />
      <circle cx="105" cy="67" r="3" fill="white" opacity="0.8" />
      <path d="M95 75 Q100 78 105 75" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      
      {/* Hair/Headband */}
      <path d="M78 65 Q100 55 122 65" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" fill="none" />
      
      {/* Body/Torso */}
      <path d="M90 92 L90 130 Q90 140 100 140 Q110 140 110 130 L110 92 Z" fill="#8B5CF6" />
      
      {/* Left arm holding cleaning tool */}
      <path d="M90 100 Q75 105 70 120" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <circle cx="70" cy="120" r="6" fill="#EC4899" />
      <rect x="65" y="115" width="10" height="3" rx="1.5" fill="#FFB156" transform="rotate(-20 70 116.5)" />
      
      {/* Right arm */}
      <path d="M110 100 Q125 105 130 120" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <circle cx="130" cy="120" r="6" fill="#EC4899" />
      
      {/* Legs */}
      <rect x="95" y="140" width="6" height="25" rx="3" fill="#3B82F6" />
      <rect x="99" y="140" width="6" height="25" rx="3" fill="#3B82F6" />
      
      {/* Cleaning spray effect */}
      <circle cx="70" cy="120" r="8" fill="#3B82F6" opacity="0.3">
        <animate attributeName="r" values="8;15;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Sparkles around person */}
      <circle cx="50" cy="50" r="3" fill="#FFB156" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="60" r="2.5" fill="#F1CB5E" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="2.5;3.5;2.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="150" r="2" fill="#8B5CF6" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="r" values="2;3;2" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="150" r="2.5" fill="#EC4899" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="2.5;3.5;2.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      
      {/* Cleaning bubbles floating */}
      <circle cx="120" cy="40" r="5" fill="#3B82F6" opacity="0.5">
        <animate attributeName="cy" values="40;30;40" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
        <animate attributeName="r" values="5;6;5" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="35" r="4" fill="#8B5CF6" opacity="0.4">
        <animate attributeName="cy" values="35;25;35" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="4;5;4" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="45" r="3.5" fill="#EC4899" opacity="0.5">
        <animate attributeName="cy" values="45;35;45" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="3.5;4.5;3.5" dur="2.8s" repeatCount="indefinite" />
      </circle>
      
      {/* Shine effect on cleaning tool */}
      <circle cx="70" cy="120" r="3" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

