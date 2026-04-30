/**
 * Use DiceBear's HTTP API to generate avatars.
 * See https://www.dicebear.com/introduction/
 */

type AvatarStyle =
  | "identicon"
  | "bottts-neutral"
  | "shapes"
  | "pixel-art"
  | "initials";

/**
 * Hash user-provided identifiers before using them in third-party avatar URLs.
 * This keeps stable avatars without leaking raw PII such as email addresses.
 */
export function getAvatarSeed(value: string): string {
  let hash = 2166136261;
  const normalizedValue = value.trim().toLowerCase();

  for (let index = 0; index < normalizedValue.length; index += 1) {
    hash ^= normalizedValue.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `user-${(hash >>> 0).toString(36)}`;
}

/**
 * Get a DiceBear avatar URL from a non-PII seed.
 */
export function getAvatarUrl(seed: string, style: AvatarStyle = "identicon"): string {
  const cleanSeed = encodeURIComponent(seed.trim().toLowerCase());
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}`;
}

/**
 * Legacy helper for fallback initials.
 */
export function getAvatarInitial(name: string, email: string) {
  const trimmedName = name.trim();
  if (trimmedName) return trimmedName[0]?.toUpperCase() ?? "Y";
  return email.trim()[0]?.toUpperCase() ?? "Y";
}
