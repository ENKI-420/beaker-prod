"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Users,
  FileText,
  Settings,
  Database,
  Activity,
  BarChart2,
  Search,
  MessageSquare,
  AlertTriangle,
  X,
  Layers,
  Dna,
  Presentation,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Enhanced sidebar component with improved navigation and responsiveness
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  // Navigation items with icons and grouping for better organization
  const navigationItems = [
    {
      group: "Main",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/patients", label: "Patients", icon: Users },
        { href: "/chat", label: "Chat Assistant", icon: MessageSquare },
      ],
    },
    {
      group: "Genomics",
      items: [
        { href: "/genetic-variants", label: "Variants", icon: Database },
        { href: "/genetic-timeline", label: "Timeline", icon: Activity },
        { href: "/variant-evolution", label: "Evolution", icon: BarChart2 },
        { href: "/genomics/enrich", label: "Data Enrichment", icon: Dna },
      ],
    },
    {
      group: "Clinical AI",
      items: [
        { href: "/services", label: "AI Services", icon: Layers },
        { href: "/patients/search", label: "Patient Search", icon: Search },
        { href: "/aiden-dashboard", label: "AIDEN Dashboard", icon: Activity },
        { href: "/presentations", label: "Presentations", icon: Presentation },
      ],
    },
    {
      group: "Reports",
      items: [
        { href: "/reports", label: "Medical Reports", icon: FileText },
        { href: "/beaker-reports", label: "Lab Results", icon: Search },
        { href: "/conflict-resolution", label: "Conflicts", icon: AlertTriangle },
      ],
    },
    {
      group: "System",
      items: [{ href: "/settings", label: "Settings", icon: Settings }],
    },
  ]

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Mobile close button */}
      <button
        className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="h-full overflow-y-auto py-4 px-3">
        {/* Sidebar header */}
        <div className="flex items-center px-2 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-blue-600"
          >
            <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" />
            <path d="M8 14a5 5 0 1 0 8 0" />
            <path d="M2 9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v0Z" />
          </svg>
          <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">Genomic Twin</span>
        </div>

        {/* Navigation groups */}
        <nav className="space-y-6">
          {navigationItems.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.group}</h3>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        // Close sidebar on mobile when clicking a link
                        if (window.innerWidth < 1024) {
                          onClose()
                        }
                      }}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                        }`}
                      />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
