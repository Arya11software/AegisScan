import React from 'react';
import AegisScanLogo from '../assets/logo/aegisscan-logo.svg';
import AegisScanMark from '../assets/logo/aegisscan-mark.svg';

export default function Logo({ size = 'md', iconOnly = false, className = '' }) {
  const heightMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12'
  };

  const selectedHeight = heightMap[size] || heightMap.md;
  const logoSrc = iconOnly ? AegisScanMark : AegisScanLogo;
  const altText = iconOnly ? 'AegisScan Mark' : 'AegisScan';

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img 
        src={logoSrc} 
        alt={altText} 
        className={`${selectedHeight} w-auto object-contain select-none`}
      />
    </div>
  );
}
