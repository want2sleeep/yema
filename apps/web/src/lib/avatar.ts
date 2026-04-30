/**
 * 使用 DiceBear HTTP API 生成用户头像。
 * 详情参考: https://www.dicebear.com/introduction/
 */

type AvatarStyle = 
  | "identicon" 
  | "bottts-neutral" 
  | "shapes" 
  | "pixel-art" 
  | "initials";

/**
 * 获取 DiceBear 头像 URL
 * @param seed 唯一标识符（如邮箱或用户名）
 * @param style 头像风格，默认为 identicon
 */
export function getAvatarUrl(seed: string, style: AvatarStyle = "identicon"): string {
  const cleanSeed = encodeURIComponent(seed.trim().toLowerCase());
  // 使用 9.x 版本的 API
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}`;
}

/**
 * 兼容旧代码：获取首字母
 */
export function getAvatarInitial(name: string, email: string) {
  const trimmedName = name.trim();
  if (trimmedName) return trimmedName[0]?.toUpperCase() ?? "Y";
  return email.trim()[0]?.toUpperCase() ?? "Y";
}
