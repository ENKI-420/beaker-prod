import CacheDashboard from "@/components/cache/cache-dashboard"

export const metadata = {
  title: "Cache Dashboard | Genomic Twin Platform",
  description: "Monitor and manage the genomic data cache performance",
}

export default function CacheDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <CacheDashboard />
    </div>
  )
}
