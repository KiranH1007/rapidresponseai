import React from 'react';

export const SirenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M7 12a5 5 0 0 1 10 0" />
    <path d="M12 12v6" />
    <path d="M12 6V5" />
    <path d="m15 9-1-1" />
    <path d="m9 9 1-1" />
    <path d="M19.3 10.7 18.6 10" />
    <path d="M5.4 10.7 4.7 10" />
    <path d="M12 21a9 9 0 0 0 9-9h-3a6 6 0 0 1-6 6v3Z" />
    <path d="M3 12a9 9 0 0 0 9 9v-3a6 6 0 0 1-6-6H3Z" />
  </svg>
);
