import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Get real-time stock market analysis and professional investment insights with StockSense AI" />
        <meta name="keywords" content="stock market, AI analysis, investment, trading, stocks, AAPL, TSLA, finance" />
        <meta name="author" content="StockSense AI" />
        <meta property="og:title" content="StockSense AI - Professional Stock Market Analysis" />
        <meta property="og:description" content="Get real-time stock market analysis and professional investment insights with StockSense AI" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
