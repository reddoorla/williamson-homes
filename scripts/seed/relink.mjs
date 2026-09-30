export function makeRelink(created) {
  const relink = (value) => {
    if (Array.isArray(value)) return value.map(relink);
    if (value && typeof value === "object") {
      if (value.link_type === "Document" && value.uid) {
        const target = `${value.type}:${value.uid}`;
        return () => {
          const doc = created.get(target);
          if (!doc)
            throw new Error(`seed: a link points at ${target}, which the seed does not create`);
          return doc;
        };
      }
      if (value.constructor !== Object) return value;
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, relink(v)]));
    }
    return value;
  };
  return relink;
}
