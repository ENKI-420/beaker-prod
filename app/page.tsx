import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

/**
 * Enhanced landing page with improved visual design and clear call-to-action
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950" />
          <div className="absolute inset-0 bg-[url('/abstract-dna.png')] opacity-10 bg-repeat" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                Genomic Twin Platform
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                Advanced genomic healthcare platform for personalized medicine and precision diagnostics
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/dashboard">Enter Platform</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Key Platform Features
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                title="Genomic Analysis"
                description="Advanced analysis of genetic variants with clinical significance interpretation"
                icon="/dna-double-helix.png"
              />
              <FeatureCard
                title="Patient Management"
                description="Comprehensive patient records with genomic data integration"
                icon="/patient-consultation.png"
              />
              <FeatureCard
                title="Clinical Decision Support"
                description="Evidence-based recommendations for personalized treatment plans"
                icon="/medical-team-collaboration.png"
              />
              <FeatureCard
                title="Variant Evolution Tracking"
                description="Monitor changes in variant interpretation over time"
                icon="/abstract-timeline.png"
              />
              <FeatureCard
                title="EHR Integration"
                description="Seamless integration with Epic and other electronic health record systems"
                icon="/placeholder.svg?height=48&width=48&query=integration"
              />
              <FeatureCard
                title="AI-Powered Insights"
                description="Machine learning algorithms for predictive analytics and pattern recognition"
                icon="/placeholder.svg?height=48&width=48&query=ai"
              />
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 bg-blue-50 dark:bg-blue-950">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Ready to Transform Genomic Healthcare?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Join the platform that's revolutionizing precision medicine through advanced genomic analysis
              </p>
              <Button asChild size="lg" className="text-base">
                <Link href="/dashboard">Get Started Today</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-300">
                © {new Date().getFullYear()} Genomic Twin Platform. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <img src={icon || "/placeholder.svg"} alt={title} className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
