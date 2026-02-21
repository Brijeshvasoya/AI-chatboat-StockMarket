export function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return "";

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(0)
      .replace(/[0-9.,\s]/g, "");
  } catch {
    return currencyCode;
  }
}