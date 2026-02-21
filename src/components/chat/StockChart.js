import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";

const formatPrice = (value, currency) =>
  `${currency && currency} ${value?.toFixed(2)}`;

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const calculatePriceChange = (data) => {
  if (!data?.length) return { change: 0, changePercent: 0, isPositive: true };
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;
  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
};

export default function StockChart({
  data = [],
  symbol,
  logo,
  currency = "₹",
}) {
  if (!data?.length) return null;

  const priceInfo = calculatePriceChange(data);
  const currentPrice = data[data.length - 1].price;

  return (
    <div className="w-full max-w-2xl rounded-3xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
      {/* Header with gradient background */}
      <div className="relative bg-linear-to-r from-blue-600/20 to-emerald-600/20 p-6 border-b border-gray-700/30">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-emerald-500/10"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {logo && (
                <img
                  src={logo}
                  alt={symbol}
                  className="w-9 h-9 rounded-2xl bg-white p-1"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              {symbol}
            </h3>
            <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
              1 Month
            </span>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-bold text-white">
              {formatPrice(currentPrice, currency)}
            </span>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                priceInfo.isPositive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <span className="text-sm font-semibold">
                {priceInfo.isPositive ? "↑" : "↓"}
              </span>
              <span className="text-sm font-bold">
                {Math.abs(priceInfo.changePercent).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-linear-to-b from-gray-900/20 to-gray-800/20">
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={priceInfo.isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={priceInfo.isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Enhanced Grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
                horizontal={true}
                vertical={false}
              />

              {/* X Axis */}
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              {/* Y Axis */}
              <YAxis
                width="auto"
                tickMargin={10}
                stroke="#9ca3af"
                fontSize={11}
                tickFormatter={(value) => formatPrice(value, currency)}
                tickLine={false}
                axisLine={false}
                domain={[
                  (dataMin) => Math.floor(dataMin * 0.98),
                  (dataMax) => Math.ceil(dataMax * 1.02),
                ]}
              />

              {/* Area under line */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="none"
                fill="url(#colorGradient)"
                fillOpacity={0.6}
                tooltipType="none"
              />

              {/* Main Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 8,
                  stroke: "#fff",
                  strokeWidth: 3,
                  fill: priceInfo.isPositive ? "#10b981" : "#ef4444",
                  className: "animate-pulse",
                }}
                animationDuration={1500}
                animationBegin={0}
              />

              {/* Enhanced Tooltip */}
              <Tooltip
                contentStyle={{
                  background:
                    "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                  border: "1px solid #374151",
                  borderRadius: "16px",
                  color: "#fff",
                  padding: "12px 16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(10px)",
                }}
                labelStyle={{
                  color: "#9ca3af",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                }
                formatter={(value) => [
                  <span
                    style={{
                      color: priceInfo.isPositive ? "#10b981" : "#ef4444",
                    }}
                  >
                    {formatPrice(value, currency)}
                  </span>,
                  "Price",
                ]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Real-time data</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
      </div>
    </div>
  );
}
