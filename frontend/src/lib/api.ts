export function getApiBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured. Set it in .env.');
  }

  return baseUrl.replace(/\/$/, '');
}
