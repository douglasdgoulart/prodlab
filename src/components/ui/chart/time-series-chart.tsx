import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"
import { ChartMadBadge } from "./chart-mad-badge"

interface TimeSeriesDataPoint {
  period: string
  value?: number
  trend?: number
  forecast?: number
}

interface TimeSeriesChartProps extends React.ComponentProps<"div"> {
  data: TimeSeriesDataPoint[]
  title?: string
  xLabel?: string
  yLabel?: string
  mad?: number
  madThresholds?: { low: number; high: number }
  height?: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-heading text-muted-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs font-mono" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(0)}
        </p>
      ))}
    </div>
  )
}

function TimeSeriesChart({
  data,
  title,
  xLabel = "Período",
  yLabel = "Demanda (un.)",
  mad,
  madThresholds = { low: 5, high: 12 },
  height = 320,
  className,
  ...props
}: TimeSeriesChartProps) {
  const hasTrend = data.some((d) => d.trend != null)
  const hasForecast = data.some((d) => d.forecast != null)

  // Find the boundary between historical and forecast
  const forecastStartIndex = data.findIndex((d) => d.forecast != null && d.value == null)
  const forecastStartPeriod =
    forecastStartIndex > 0 ? data[forecastStartIndex].period : null
  const lastHistoricalPeriod =
    forecastStartIndex > 0 ? data[forecastStartIndex - 1].period : null

  // For the forecast line to connect visually, the last historical point
  // needs a forecast value equal to its actual value
  const chartData = data.map((d, i) => {
    if (i === forecastStartIndex - 1 && d.value != null && d.forecast == null) {
      return { ...d, forecast: d.value }
    }
    return d
  })

  const lastPeriod = data[data.length - 1]?.period

  return (
    <div
      data-slot="time-series-chart"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {(title || mad != null) && (
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-sm font-heading font-semibold text-foreground">
              {title}
            </h3>
          )}
          {mad != null && (
            <ChartMadBadge value={mad} thresholds={madThresholds} />
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12, fontFamily: "Outfit", fill: "var(--color-muted-foreground)" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
              label={
                xLabel
                  ? {
                      value: xLabel,
                      position: "insideBottom",
                      offset: -4,
                      style: { fontSize: 11, fontFamily: "Outfit", fill: "var(--color-muted-foreground)" },
                    }
                  : undefined
              }
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono", fill: "var(--color-muted-foreground)" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
              label={
                yLabel
                  ? {
                      value: yLabel,
                      angle: -90,
                      position: "insideLeft",
                      offset: 4,
                      style: { fontSize: 11, fontFamily: "Outfit", fill: "var(--color-muted-foreground)" },
                    }
                  : undefined
              }
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Forecast area highlight */}
            {hasForecast && forecastStartPeriod && (
              <ReferenceArea
                x1={lastHistoricalPeriod ?? forecastStartPeriod}
                x2={lastPeriod}
                fill="#D9E2FF"
                fillOpacity={0.2}
              />
            )}

            {/* Forecast separator line */}
            {hasForecast && lastHistoricalPeriod && (
              <ReferenceLine
                x={lastHistoricalPeriod}
                stroke="var(--color-chart-2)"
                strokeDasharray="6 4"
                strokeWidth={1}
              />
            )}

            {/* Historical line */}
            <Line
              type="monotone"
              dataKey="value"
              name="Histórico"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-chart-1)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />

            {/* Trend line */}
            {hasTrend && (
              <Line
                type="monotone"
                dataKey="trend"
                name="Tendência"
                stroke="var(--color-chart-2)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                activeDot={false}
              />
            )}

            {/* Forecast line */}
            {hasForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="Previsão"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--color-chart-3)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            )}

            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: "Outfit" }}
              iconType="plainline"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export { TimeSeriesChart }
export type { TimeSeriesChartProps, TimeSeriesDataPoint }
