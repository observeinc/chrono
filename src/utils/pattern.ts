type DictionaryLike = string[] | Record<string, unknown> | Map<string, unknown>;

export function repeatedTimeunitPattern(
  prefix: string,
  singleTimeunitPattern: string,
  connectorPattern = String.raw`\s{0,5},?\s{0,5}`
): string {
  const singleTimeunitPatternNoCapture = singleTimeunitPattern.replaceAll(
    /\((?!\?)/g,
    "(?:"
  );
  return `${prefix}${singleTimeunitPatternNoCapture}(?:${connectorPattern}${singleTimeunitPatternNoCapture}){0,10}`;
}

export function extractTerms(dictionary: DictionaryLike): string[] {
  let keys: string[];
  if (Array.isArray(dictionary)) {
    keys = [...dictionary];
  } else if (dictionary instanceof Map) {
    keys = [...dictionary.keys()];
  } else {
    keys = Object.keys(dictionary);
  }

  return keys;
}

export function matchAnyPattern(dictionary: DictionaryLike): string {
  // TODO: More efficient regex pattern by considering duplicated prefix

  const joinedTerms = extractTerms(dictionary)
    .sort((a, b) => b.length - a.length)
    .join("|")
    .replaceAll(".", String.raw`\.`);

  return `(?:${joinedTerms})`;
}
