// Client-side text and entity cleaner

export function cleanHtmlText(raw: string | null | undefined): string {
  if (!raw) return '';

  const entities: Record<string, string> = {
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&sbquo;': "'",
    '&bdquo;': '"',
    '&apos;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&nbsp;': ' ',
    '&oslash;': 'ø',
    '&Oslash;': 'Ø',
    '&aring;': 'å',
    '&Aring;': 'Å',
    '&aelig;': 'æ',
    '&AElig;': 'Æ',
    '&auml;': 'ä',
    '&ouml;': 'ö',
    '&uuml;': 'ü',
    '&Auml;': 'Ä',
    '&Ouml;': 'Ö',
    '&Uuml;': 'Ü',
    '&szlig;': 'ß',
    '&eacute;': 'é',
    '&Eacute;': 'É',
    '&egrave;': 'è',
    '&Egrave;': 'È',
    '&ecirc;': 'ê',
    '&Ecirc;': 'Ê',
    '&euml;': 'ë',
    '&Euml;': 'Ë',
    '&agrave;': 'à',
    '&Agrave;': 'À',
    '&aacute;': 'á',
    '&Aacute;': 'Á',
    '&acirc;': 'â',
    '&Acirc;': 'Â',
    '&atilde;': 'ã',
    '&Atilde;': 'Ã',
    '&ccedil;': 'ç',
    '&Ccedil;': 'Ç',
    '&ntilde;': 'ñ',
    '&Ntilde;': 'Ñ',
    '&bull;': '•',
    '&middot;': '·',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  };

  let text = raw;

  for (const [entity, char] of Object.entries(entities)) {
    text = text.replaceAll(entity, char);
  }

  // Handle numeric entities
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    try {
      const code = parseInt(dec, 10);
      return String.fromCodePoint ? String.fromCodePoint(code) : String.fromCharCode(code);
    } catch {
      return '';
    }
  });

  text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    try {
      const code = parseInt(hex, 16);
      return String.fromCodePoint ? String.fromCodePoint(code) : String.fromCharCode(code);
    } catch {
      return '';
    }
  });

  // Strip PR contacts & spokesperson artifacts
  text = text.replace(/Press Contact:?[\s\S]*?(?=\n\n|$)/gi, '');
  text = text.replace(/Media Contact:?[\s\S]*?(?=\n\n|$)/gi, '');
  text = text.replace(/PR Contact:?[\s\S]*?(?=\n\n|$)/gi, '');
  text = text.replace(/Press Contact\s+[A-Za-z\s]+/gi, '');
  text = text.replace(/Franziska\s+Kegel/gi, '');

  return text.trim();
}
