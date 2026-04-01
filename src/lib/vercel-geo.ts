
export function getVercelGeoHints(headers: Headers): {
  location?: string;
  timezone?: string;
  isp?: string;
} {
  const city = headers.get("x-vercel-ip-city")?.trim();
  const region = headers.get("x-vercel-ip-country-region")?.trim();
  const country = headers.get("x-vercel-ip-country")?.trim();
  const timezone = headers.get("x-vercel-ip-timezone")?.trim();
  const isp = headers.get("x-vercel-ip-isp")?.trim();

  const parts = [city, region, country].filter(Boolean);
  const location = parts.length > 0 ? parts.join(", ") : undefined;

  const out: { location?: string; timezone?: string; isp?: string } = {};
  if (location) out.location = location;
  if (timezone) out.timezone = timezone;
  if (isp) out.isp = isp;
  return out;
}
