export const StockDataToolPrompt = `Fetch real-time stock data. 
IMPORTANT: You MUST always call this tool with a valid symbol argument.
NEVER call with empty arguments {}.
Always use format: {"symbol": "TICKER"}

Symbol rules:
- BSE Indian stocks → append .BO (e.g. INFY.BO, RELIANCE.BO, TCS.BO)
- NSE Indian stocks → append .NS (e.g. INFY.NS, RELIANCE.NS)  
- US stocks → plain symbol (e.g. AAPL, TSLA, GOOGL)

Examples of correct calls:
- "INFY from bombay stock exchange" → {"symbol": "INFY.BO"}
- "Reliance NSE" → {"symbol": "RELIANCE.NS"}
- "Apple stock" → {"symbol": "AAPL"}`