import React from "react";

/** Logo oficial de TikTok como SVG (lucide-react no incluye este icono). */
export default function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.6 5.82c-.9-.98-1.4-2.25-1.4-3.57V2h-3.1v12.67c0 1.46-1.18 2.64-2.64 2.64a2.64 2.64 0 0 1 0-5.28c.27 0 .53.04.78.12V8.98a5.73 5.73 0 0 0-.78-.05 5.74 5.74 0 1 0 5.74 5.74V8.9a7.5 7.5 0 0 0 4.4 1.41V7.21c-1.2 0-2.3-.5-3-1.39Z" />
    </svg>
  );
}
