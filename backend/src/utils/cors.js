export function isAllowedOrigin(
  origin,
  {
    clientUrl = process.env.CLIENT_URL,
    vercelPreviewTeamSlug = process.env.VERCEL_PREVIEW_TEAM_SLUG,
  } = {},
) {
  if (!origin) return false;
  if (origin === clientUrl) return true;
  if (!/^[a-z0-9-]+$/.test(vercelPreviewTeamSlug ?? '')) return false;

  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' || url.origin !== origin) return false;
  return new RegExp(
    `^hiit-coach-[a-z0-9-]+-${vercelPreviewTeamSlug}\\.vercel\\.app$`,
  ).test(url.hostname);
}

export function corsOrigin(origin, callback) {
  callback(null, isAllowedOrigin(origin));
}
