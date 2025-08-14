import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ToggleSwitch({ 
  checked, 
  onToggle, 
  disabled = false, 
  size = 'md' 
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  }

  const { switch: switchClass, thumb: thumbClass, translate: translateClass } = sizeClasses[size]

  const handleClick = () => {
    if (!disabled) {
      console.log('Toggle clicked, current checked:', checked);
      onToggle();
    }
  };

  return (
    <button
      type="button"
      className={`
        ${switchClass}
        ${checked 
          ? 'bg-green-600 focus:ring-green-500' 
          : 'bg-gray-200 focus:ring-gray-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        relative inline-flex items-center rounded-full border-2 border-transparent 
        transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
      `}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={checked ? 'Deactivate' : 'Activate'}
    >
      <span
        className={`
          ${thumbClass}
          ${checked ? translateClass : 'translate-x-0'}
          pointer-events-none inline-block rounded-full bg-white shadow transform 
          ring-0 transition ease-in-out duration-200
        `}
      />
    </button>
  )
}