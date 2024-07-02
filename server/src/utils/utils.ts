export type EmojiResponse = string[];

export function getEmojis(): EmojiResponse {
  let emojis: string[] = [];
  emojis.push('😀');
  emojis.push('😳');
  emojis.push('🙄');
  return emojis;
}
