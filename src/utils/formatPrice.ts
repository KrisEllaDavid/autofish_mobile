/**
 * Price formatting.
 *
 * The API serialises price as a Django DecimalField, which DRF renders as a
 * *string* ("3500.00"), not a number — even though our TypeScript types
 * (optimistically) declare it as `number`. Calling `.toLocaleString()` on a
 * string does nothing (String.prototype.toLocaleString is a no-op formatter),
 * which is why prices were rendering as the raw API string, decimals and all,
 * instead of a grouped, currency-formatted amount.
 *
 * Always route a price through this before display.
 */
export const formatPrice = (price: number | string | null | undefined): string => {
  const value = typeof price === "string" ? Number(price) : price;

  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0";
  }

  // FCFA has no minor unit in everyday use — 3500.00 reads as "3 500", not
  // "3 500,00".
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
};
