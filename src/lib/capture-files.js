/**
 * @param {{ files: Array<{ file: string }> }} manifest
 * @param {string} key
 * @returns {string}
 */
export function captureFileFor(manifest, key) {
  const suffix = `/${key}`;
  const hits = manifest.files.filter((file) => file.file.endsWith(suffix));
  if (hits.length !== 1) {
    throw new Error(`capture key ${JSON.stringify(key)} matched ${hits.length} files, expected 1`);
  }
  return hits[0].file;
}

/**
 * @param {(img: (key: string) => unknown) => unknown} documents
 * @returns {string[]}
 */
export function collectImageKeys(documents) {
  /** @type {Set<string>} */
  const keys = new Set();
  documents((key) => {
    keys.add(key);
    return { key };
  });
  return [...keys];
}
