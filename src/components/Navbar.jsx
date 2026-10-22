import React, { useState, useEffect } from 'react';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

export default function Navbar({ isOpen, setIsOpen }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memisahkan render secara mutlak antara Desktop dan Mobile
  if (isDesktop) {
    return <DesktopNavbar isOpen={isOpen} setIsOpen={setIsOpen} />;
  }

  return <MobileNavbar />;
}