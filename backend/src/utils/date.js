/**
 * Converte uma string de data (yyyy-MM-dd) em objeto Date.
 * - undefined -> undefined (não altera)
 * - "" ou null -> null
 * - "2025-11-10" -> Date
 */
function converterData(data) {
  if (typeof data === "undefined") return undefined;
  if (data === null || (typeof data === "string" && data.trim() === ""))
    return null;
  return new Date(data);
}

/**
 * Formata uma data (Date) para "yyyy-MM-dd".
 */
function formatarData(data) {
  if (!data) return null;
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = data.getFullYear();
  const mm = pad(data.getMonth() + 1);
  const dd = pad(data.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = { converterData, formatarData };
