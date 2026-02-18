import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

function calculateMOSPercent(price, eps, bookValue) {
  if (!price || !eps || !bookValue) return null;

  const intrinsic = Math.sqrt(22.5 * eps * bookValue);
  return Number((((intrinsic - price) / intrinsic) * 100).toFixed(2));
}

function calculateFourMScore(data) {
  let score = 0;

  if (data.peRatio && data.peRatio < 15) score += 25;
  else if (data.peRatio && data.peRatio < 25) score += 18;
  else score += 10;

  if (data.marketCap > 10e9) score += 25;
  else if (data.marketCap > 2e9) score += 18;
  else score += 10;

  if (data.eps > 3) score += 25;
  else if (data.eps > 1) score += 18;
  else score += 10;

  if (data.changePercent > 5) score += 25;
  else if (data.changePercent > 0) score += 18;
  else score += 10;

  return Math.min(score, 100);
}

export async function fetchStockData(symbol) {
  const quote = await yahooFinance.quote(symbol);

  const time =
    quote.regularMarketTime > 1e12
      ? quote.regularMarketTime
      : quote.regularMarketTime * 1000;
  const eps = quote.epsTrailingTwelveMonths;
  const bookValue = quote.bookValue;
  const price = quote.regularMarketPrice;

  const mosPercent = calculateMOSPercent(price, eps, bookValue);

  const result = {
    stock: quote.longName || quote.shortName || symbol,
    symbol,
    price: quote.regularMarketPrice,
    previousClose: quote.regularMarketPreviousClose,
    changePercent: quote.regularMarketChangePercent,
    weekHigh52: quote.fiftyTwoWeekHigh,
    weekLow52: quote.fiftyTwoWeekLow,
    weekHigh52ChangePercent: quote.fiftyTwoWeekHighChangePercent,
    weekLow52ChangePercent: quote.fiftyTwoWeekLowChangePercent,
    volume: quote.regularMarketVolume,
    marketCap: quote.marketCap,
    peRatio: quote.trailingPE,
    currency: quote.currency,
    exchange: quote.fullExchangeName,
    marketTime: new Date(time).toLocaleString(),
  };
  const fourMScore = calculateFourMScore(result);

  return {
    ...result,
    marginOfSafety: mosPercent ? `${mosPercent}%` : null,
    fourMScore: `${fourMScore}/100`,
  };
}