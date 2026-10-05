/**
 * Emoji a player can send as a quick reaction during a Running game, rendered as one button per
 * entry by RampQuickReactions. Growing this list is the only change needed to add more; keep it in
 * sync with the server-side allow-list (server/Algowars.Domain/Games/GameReactionEmojis.cs), which
 * is the one that actually enforces what's accepted.
 */
export const QUICK_REACTIONS: readonly string[] = [
  "👍",
  "🔥",
  "😂",
  "😮",
  "💪",
  "🎉",
  "😅",
  "🤝",
];
