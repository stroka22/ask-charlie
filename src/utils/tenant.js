export function resolveTenantSlug(hostname, search='') {
  try {
    const url = new URL(`https://${hostname}${search || ''}`);
    const param = url.searchParams.get('org');
    if (param) return param.toLowerCase();
  } catch (e) {}
  const parts = (hostname || '').split('.');
  if (parts.length > 2) return parts[0].toLowerCase();
  return null;
}
