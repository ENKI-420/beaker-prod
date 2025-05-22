import RedisPoolDashboard from "@/components/monitoring/redis-pool-dashboard"

export const metadata = {
  title: "Redis Connection Pool Monitoring",
  description: "Monitor and analyze Redis connection pool performance",
}

export default function RedisPoolMonitoringPage() {
  return (
    <div className="container mx-auto py-8">
      <RedisPoolDashboard />
    </div>
  )
}
