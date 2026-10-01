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

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
