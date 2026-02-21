import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
  ReferenceLine,
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
    <div className="w-full max-w-2xl rounded-3xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/30 shadow-2xl overflow-hidden transition-all duration-300 ">
      
      {/* ---------- HEADER ---------- */}
      <div className="relative bg-linear-to-r from-blue-600/20 to-emerald-600/20 p-6 border-b border-gray-700/30">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-emerald-500/10"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {logo && (
                <img
                  src={logo}
                  alt={symbol}
                  className="w-9 h-9 rounded-xl bg-white p-1"
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

      {/* ---------- CHART ---------- */}
      <div className="bg-linear-to-b from-gray-900/20 to-gray-800/20">
        <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
            >
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={priceInfo.isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={priceInfo.isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0}
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
                opacity={0.15}
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
                tickCount={10}
                tickFormatter={(value) => formatPrice(value, currency)}
                tickLine={false}
                axisLine={false}
                domain={[
                  (dataMin) => Math.floor(dataMin * 0.98),
                  (dataMax) => Math.ceil(dataMax * 1.02),
                ]}
              />

              {/* ----- CURRENT PRICE LINE ----- */}
              <ReferenceLine
                y={currentPrice}
                stroke={priceInfo.isPositive ? "#10b981" : "#ef4444"}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />

              {/* ----- AREA ----- */}
              <Area
                type="natural"
                dataKey="price"
                stroke="none"
                fill="url(#colorGradient)"
                animationDuration={1200}
                animationEasing="ease-out"
                tooltipType="none"
              />

              {/* ----- MAIN LINE ----- */}
              <Line
                type="natural"
                dataKey="price"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={false}
                animationDuration={1200}
                animationEasing="ease-out"
                style={{
                  filter: "drop-shadow(0px 0px 6px rgba(59,130,246,0.6))",
                }}
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: priceInfo.isPositive ? "#10b981" : "#ef4444",
                }}
              />

              {/* Enhanced Tooltip */}
              <Tooltip
                cursor={{
                  stroke: "#6b7280",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  background:
                    "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "#fff",
                  padding: "10px 14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                }}
                labelStyle={{ color: "#9ca3af", fontSize: "12px" }}
                formatter={(value) => formatPrice(value, currency)}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                }
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
