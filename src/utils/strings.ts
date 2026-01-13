export function toTitleCase(str: string, delimiters: string | string[] = ' ') {
  if (!str) return str

  const delimiterArray = Array.isArray(delimiters) ? delimiters : [delimiters]

  const pattern = delimiterArray.map(d => {
    return d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('|')

  const regex = new RegExp(`(${pattern})`, 'g');

  const parts = str.split(regex);

  const result = parts.map((part: string) => {
    if (delimiterArray.includes(part)) {
      return part
    }

    if (part.length > 0) {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    }
    return part
  })

  return result.join('')
}
