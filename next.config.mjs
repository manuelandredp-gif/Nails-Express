/** @type {import('next').NextConfig} */

// Fuerza la zona horaria del salón (Vercel corre en UTC y no permite la env var TZ).
if (!process.env.TZ) {
  process.env.TZ = "America/Lima";
}

// Host de Supabase Storage (si está configurado) para permitir sus imágenes.
let supabaseHost = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch (_) {
  /* URL inválida: se ignora */
}

const remotePatterns = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "res.cloudinary.com" },
];
if (supabaseHost) {
  remotePatterns.push({ protocol: "https", hostname: supabaseHost });
}

const supa = supabaseHost ? `https://${supabaseHost}` : "";

// Content-Security-Policy: bloquea scripts/recursos de orígenes no autorizados.
// Se permite 'unsafe-inline'/'unsafe-eval' porque Next hidrata con scripts en
// línea sin nonce; aun así se cierra la carga desde dominios externos (el vector
// principal de XSS) y se prohíbe que la web sea incrustada (anti-clickjacking).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  `img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com ${supa}`.trim(),
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${supa}`.trim(),
  "frame-src https://www.google.com https://maps.google.com https://maps.app.goo.gl https://*.google.com",
  "form-action 'self'",
  "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // no revelar el framework
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
