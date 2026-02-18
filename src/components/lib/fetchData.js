import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});
export async function fetchStockData(symbol) {
  const quote = await yahooFinance.quote(symbol);

  const time =
    quote.regularMarketTime > 1e12
      ? quote.regularMarketTime
      : quote.regularMarketTime * 1000;

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

  return result;
}