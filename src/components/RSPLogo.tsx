import React from 'react'

interface RSPLogoProps {
  logoUrl?: string
  className?: string
}

export const RSPLogo: React.FC<RSPLogoProps> = ({ logoUrl, className = '' }) => {
  const src = logoUrl || '/images/logo-rsp.png'
  return (
    <img
      src={src}
      alt="RSP Music Logo"
      className={`h-16 w-auto object-contain select-none ${className}`}
    />
  )
}
