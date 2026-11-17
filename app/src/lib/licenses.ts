export function licenseUrl(license: string): string | null {
  if (license === 'CC0') return 'https://creativecommons.org/publicdomain/zero/1.0/';
  if (license === 'Public Domain') return 'https://creativecommons.org/publicdomain/mark/1.0/';

  const match = license.match(/^CC (BY(?:-SA)?) ([\d.]+)$/i);
  if (!match) return null;
  const [, type, version] = match;
  return `https://creativecommons.org/licenses/${type.toLowerCase()}/${version}/`;
}