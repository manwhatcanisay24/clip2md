const WINDOWS_RESERVED_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export function sanitizeFilename(title: string, maxLength = 100): string {
  const withoutUnsafeCharacters = Array.from(title.normalize('NFKC'), (character) => {
    const code = character.codePointAt(0) ?? 0;
    if (/\s/.test(character)) return ' ';
    return code < 32 || '<>:"/\\|?*'.includes(character) ? '-' : character;
  }).join('');
  const cleaned = withoutUnsafeCharacters
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .replace(/^-+|-+$/g, '')
    .trim();

  const shortened = cleaned.slice(0, Math.max(1, maxLength - 3)).replace(/[. -]+$/g, '');
  const fallback = shortened || 'clip2md-note';
  return `${WINDOWS_RESERVED_NAME.test(fallback) ? `${fallback}-note` : fallback}.md`;
}
