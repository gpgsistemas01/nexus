export const sanitizeEmptyStrings = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === '' ? null : value
    ])
  );
};

export const cleanSearchTerm = (search) => {

  const cleaned = search.trim();
  let codeSearch = search;
  let nameSearch = search;

  if (cleaned.includes('-')) {

    const parts = cleaned.split('-').map(part => part.trim());
    codeSearch = parts[0];
    nameSearch = parts.slice(1).join('-');
  }

  return { codeSearch, nameSearch };
};