const AVATAR_PALETTE = [
  ["#2563eb", "#60a5fa"],
  ["#0f766e", "#34d399"],
  ["#7c3aed", "#a78bfa"],
  ["#b45309", "#f59e0b"],
  ["#be123c", "#fb7185"],
  ["#1d4ed8", "#38bdf8"],
] as const;

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getAvatarInitial(name: string, email: string) {
  const trimmedName = name.trim();

  if (trimmedName) {
    return trimmedName[0]?.toUpperCase() ?? "Y";
  }

  return email.trim()[0]?.toUpperCase() ?? "Y";
}

export function getAvatarGradient(name: string, email: string) {
  const seed = `${name}:${email}`;
  const palette = AVATAR_PALETTE[hashString(seed) % AVATAR_PALETTE.length];

  return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
}
