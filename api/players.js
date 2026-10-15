const TEAM_PAGE = "https://cricclubs.com/cricketorjp/viewTeam.do?teamId=2732&clubId=21278";

function decodeEntities(value = "") {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripMarkup(value = "") {
  return decodeEntities(value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ").trim());
}

function absoluteUrl(path) {
  if (!path || /^(?:javascript:|data:)/i.test(path)) return null;
  try { return new URL(path, TEAM_PAGE).href; } catch { return null; }
}

export function extractPlayers(html) {
  const found = new Map();
  // The CricClubs team page has varied between deployments. Prefer links explicitly
  // pointing to a player profile; do not guess players from unrelated page text.
  const anchorPattern = /<a\b([^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorPattern.exec(html))) {
    const attrs = match[1] || "";
    const href = match[2] || match[3] || match[4] || "";
    const text = stripMarkup(match[5]);
    if (!text || text.length > 80 || !/(?:viewPlayer|playerId|playerID|playerProfile)/i.test(href)) continue;
    if (/^(?:view|edit|profile|details|player)$/i.test(text)) continue;
    const profileUrl = absoluteUrl(href);
    if (!profileUrl) continue;
    const key = text.toLocaleLowerCase();
    if (!found.has(key)) found.set(key, {
      id: new URL(profileUrl).searchParams.get("playerId") || new URL(profileUrl).searchParams.get("playerID") || key,
      name: text,
      role: "TSK Player",
      initials: text.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(),
      profileUrl,
      photoUrl: null,
    });
  }

  // Some pages expose the roster in JSON embedded in the HTML. This is a narrow
  // fallback for name/profile fields; it intentionally avoids general name scraping.
  if (!found.size) {
    const jsonNamePattern = /(?:playerName|fullName|displayName)\s*["']?\s*:\s*["']([^"']{2,80})["']/gi;
    while ((match = jsonNamePattern.exec(html))) {
      const name = stripMarkup(match[1]);
      if (!name || /cricclubs|player name/i.test(name)) continue;
      const key = name.toLocaleLowerCase();
      if (!found.has(key)) found.set(key, {
        id: key,
        name,
        role: "TSK Player",
        initials: name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(),
        profileUrl: null,
        photoUrl: null,
      });
    }
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ players: [], message: "Method not allowed." });
  }

  try {
    const response = await fetch(TEAM_PAGE, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TSKClubPortal/1.0; roster sync)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      return res.status(502).json({ players: [], message: `CricClubs returned HTTP ${response.status}. Open the official team page directly or try again later.` });
    }
    const html = await response.text();
    if (/cloudflare|checking your browser|verify you are human|access denied/i.test(html.slice(0, 50000))) {
      return res.status(502).json({ players: [], message: "CricClubs blocked the automated roster request. The public page is still available through the official link." });
    }
    const players = extractPlayers(html);
    if (!players.length) {
      return res.status(502).json({ players: [], message: "The CricClubs page loaded, but its roster could not be identified safely. Its page structure may have changed; no sample names were substituted." });
    }
    return res.status(200).json({ players, source: TEAM_PAGE, syncedAt: new Date().toISOString() });
  } catch (error) {
    return res.status(502).json({ players: [], message: "Could not reach CricClubs from the server. The roster sync may be blocked by network or anti-bot protection." });
  }
}
