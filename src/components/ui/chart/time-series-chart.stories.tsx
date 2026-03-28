import { TimeSeriesChart } from "./time-series-chart"
import { ChartMadBadge } from "./chart-mad-badge"
import type { TimeSeriesDataPoint } from "./time-series-chart"

export default {
  title: "UI / TimeSeriesChart",
}

const historicalData: TimeSeriesDataPoint[] = [
  { period: "Jan", value: 120 },
  { period: "Fev", value: 135 },
  { period: "Mar", value: 128 },
  { period: "Abr", value: 142 },
  { period: "Mai", value: 155 },
  { period: "Jun", value: 148 },
  { period: "Jul", value: 162 },
  { period: "Ago", value: 170 },
  { period: "Set", value: 165 },
  { period: "Out", value: 178 },
  { period: "Nov", value: 185 },
  { period: "Dez", value: 192 },
]

const withTrendData: TimeSeriesDataPoint[] = historicalData.map((d, i) => ({
  ...d,
  trend: 125 + i * 5,
}))

const withForecastData: TimeSeriesDataPoint[] = [
  ...historicalData,
  { period: "Jan+1", forecast: 188 },
  { period: "Fev+1", forecast: 195 },
  { period: "Mar+1", forecast: 200 },
  { period: "Abr+1", forecast: 207 },
  { period: "Mai+1", forecast: 212 },
  { period: "Jun+1", forecast: 218 },
]

const fullData: TimeSeriesDataPoint[] = [
  ...withTrendData,
  { period: "Jan+1", forecast: 188, trend: 185 },
  { period: "Fev+1", forecast: 195, trend: 190 },
  { period: "Mar+1", forecast: 200, trend: 195 },
  { period: "Abr+1", forecast: 207, trend: 200 },
  { period: "Mai+1", forecast: 212, trend: 205 },
  { period: "Jun+1", forecast: 218, trend: 210 },
]

export const Default = () => (
  <div className="max-w-2xl">
    <p className="text-xs font-mono text-muted-foreground mb-3">default — apenas histórico</p>
    <TimeSeriesChart
      title="Demanda Histórica — Família A"
      data={historicalData}
    />
  </div>
)

export const WithTrend = () => (
  <div className="max-w-2xl">
    <p className="text-xs font-mono text-muted-foreground mb-3">with-trend — histórico + tendência</p>
    <TimeSeriesChart
      title="Demanda com Linha de Tendência"
      data={withTrendData}
    />
  </div>
)

export const WithForecast = () => (
  <div className="max-w-2xl">
    <p className="text-xs font-mono text-muted-foreground mb-3">with-forecast — histórico + previsão</p>
    <TimeSeriesChart
      title="Previsão de Demanda — Próximos 6 Meses"
      data={withForecastData}
      mad={4.2}
    />
  </div>
)

export const Full = () => (
  <div className="max-w-2xl">
    <p className="text-xs font-mono text-muted-foreground mb-3">full — todas as camadas + MAD alto</p>
    <TimeSeriesChart
      title="Diagnóstico Completo — Método Inadequado"
      data={fullData}
      mad={28.7}
    />
  </div>
)

export const MadBadgeSeverities = () => (
  <div className="flex flex-col gap-4">
    <p className="text-xs font-mono text-muted-foreground mb-1">ChartMadBadge — severidades</p>
    <div className="flex items-center gap-3">
      <ChartMadBadge value={3.2} />
      <ChartMadBadge value={8.5} />
      <ChartMadBadge value={14.2} />
    </div>
    <div className="flex items-center gap-3">
      <ChartMadBadge value={3.2} severity="low" />
      <ChartMadBadge value={8.5} severity="medium" />
      <ChartMadBadge value={14.2} severity="high" />
    </div>
  </div>
)

export const AllVariants = () => (
  <div className="flex flex-col gap-8 max-w-2xl">
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">1. default</p>
      <TimeSeriesChart data={historicalData} />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">2. with-trend</p>
      <TimeSeriesChart data={withTrendData} />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">3. with-forecast (MAD baixo)</p>
      <TimeSeriesChart data={withForecastData} mad={4.2} />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">4. full (MAD alto)</p>
      <TimeSeriesChart data={fullData} mad={28.7} />
    </div>
  </div>
)
