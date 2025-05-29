export const environment = {
  production: true,
  apiUrl: "https://api.yourdomain.com/api",
  jwtSecret: process.env["JWT_SECRET"] || "your-production-secret-key",
};
