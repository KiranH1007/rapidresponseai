import React from 'react';

export const HospitalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 6v4" />
    <path d="M14 8h-4" />
    <path d="M14 16h-4" />
    <path d="M14 12h-4" />
    <path d="M10 18v-2" />
    <path d="M14 18v-2" />
    <path d="M18 20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2" />
    <path d="M12 20v-4" />
  </svg>
);
