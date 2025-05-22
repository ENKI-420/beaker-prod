import RedisMetricsDashboard from "@/components/redis/metrics-dashboard"

export const metadata = {
  title: "Redis Metrics Dashboard",
  description: "Comprehensive visualization of Redis performance metrics",
}

export default function RedisMetricsPage() {
  return (
    <div className="container mx-auto py-8">
      <RedisMetricsDashboard />
    </div>
  )
}
