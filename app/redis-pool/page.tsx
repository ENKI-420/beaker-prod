import type { Metadata } from "next"
import RedisPoolVisualizer from "@/components/redis/redis-pool-visualizer"

export const metadata: Metadata = {
  title: "Redis Connection Pool",
  description: "Monitor and manage Redis connection pool",
}

export default function RedisPoolPage() {
  return (
    <div className="container mx-auto py-8">
      <RedisPoolVisualizer />
    </div>
  )
}
