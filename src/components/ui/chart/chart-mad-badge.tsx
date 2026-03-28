import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const madBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold font-mono shadow-sm",
  {
    variants: {
      severity: {
        low: "bg-chart-5/10 text-chart-5",
        medium: "bg-chart-3/10 text-chart-3",
        high: "bg-chart-4/10 text-chart-4",
      },
    },
    defaultVariants: {
      severity: "medium",
    },
  }
)

interface ChartMadBadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof madBadgeVariants> {
  value: number
  thresholds?: { low: number; high: number }
}

function inferSeverity(
  value: number,
  thresholds: { low: number; high: number }
): "low" | "medium" | "high" {
  if (value <= thresholds.low) return "low"
  if (value >= thresholds.high) return "high"
  return "medium"
}

function ChartMadBadge({
  value,
  severity,
  thresholds = { low: 5, high: 12 },
  className,
  ...props
}: ChartMadBadgeProps) {
  const resolved = severity ?? inferSeverity(value, thresholds)

  return (
    <span
      data-slot="chart-mad-badge"
      className={cn(madBadgeVariants({ severity: resolved }), className)}
      {...props}
    >
      MAD: {value.toFixed(1)}
      {resolved === "high" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-3"
        >
          <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </span>
  )
}

export { ChartMadBadge, madBadgeVariants }
export type { ChartMadBadgeProps }
