import React from 'react';

export const FireExtinguisherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5" />
    <path d="M14 15V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6" />
    <path d="M6 15h8" />
    <path d="M10 21v-3.46a2 2 0 0 1 .55-1.4L12 15l1.45.14a2 2 0 0 1 .55 1.4V21" />
  </svg>
);
