// Upload de comprovantes e documentos passa pelas Server Actions: limite de 10 MB.
const nextConfig = { experimental: { serverActions: { bodySizeLimit: "10mb" } } };
export default nextConfig;
