function parseHostname(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isPrivateOrLocalUrl(value: string) {
  const hostname = parseHostname(value);

  if (!hostname) {
    return false;
  }

  if (
    hostname === "localhost" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  ) {
    return true;
  }

  if (hostname.startsWith("127.")) {
    return true;
  }

  if (hostname.startsWith("10.")) {
    return true;
  }

  if (hostname.startsWith("192.168.")) {
    return true;
  }

  const private172 = /^172\.(1[6-9]|2\d|3[0-1])\./;
  return private172.test(hostname);
}

export function getPrivateUrlMessage(value: string) {
  const hostname = parseHostname(value);

  return `The deployed scanner cannot access ${hostname || "this local URL"}. Public deployments cannot reach your machine's localhost or private network. Run UXRay locally, or expose the site through a public URL such as a preview deployment or tunnel.`;
}
