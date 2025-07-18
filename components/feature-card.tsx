"use client";
import * as React from 'react';
import Link from 'next/link';

export interface FeatureCardProps {
    title: string;
    description: string;
    href: string;
    icon: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    description,
    href,
    icon,
}) => {
    const [hovered, setHovered] = React.useState(false);
    const handleHover = (state: boolean) => setHovered(state);

    return (
        <Link href={href} passHref legacyBehavior>
            <a
                className={`relative overflow-hidden group block p-6 bg-white rounded-xl shadow transition border border-gray-200 cursor-pointer h-full flex flex-col justify-between ${
                    hovered ? 'ring-2 ring-blue-400 scale-105' : ''
                }`}
                tabIndex={0}
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
                onFocus={() => handleHover(true)}
                onBlur={() => handleHover(false)}
                role="button"
                aria-label={`Go to ${title}`}
            >
                {/* Animated Gradient Background */}
                <span
                    aria-hidden
                    className="absolute inset-0 z-0 transition-all duration-700 bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 opacity-0 group-hover:opacity-80 group-focus:opacity-80 blur-2xl scale-110 animate-gradient-move"
                ></span>
                {/* Animated Floating Dots */}
                <span className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-pulse"></span>
                <span className="absolute bottom-6 right-6 w-2 h-2 bg-pink-400 rounded-full opacity-50 animate-ping"></span>
                <span className="absolute top-8 right-8 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-40 animate-bounce"></span>
                {/* Card Content */}
                <div className="flex items-center mb-3 relative z-10">
                    <span className="text-3xl mr-3 drop-shadow-lg">{icon}</span>
                    <h2 className="text-xl font-semibold text-blue-900 drop-shadow-sm">{title}</h2>
                </div>
                <p className="text-gray-600 text-sm flex-1 relative z-10 drop-shadow-sm">{description}</p>
                <span className="mt-4 font-medium text-blue-600 underline relative z-10 transition-colors group-hover:text-pink-600 group-focus:text-pink-600">Explore &rarr;</span>
            </a>
        </Link>
    );
};

// Tailwind CSS keyframes (add to your global CSS or tailwind.config.js):
// .animate-gradient-move {
//   animation: gradient-move 6s ease-in-out infinite;
// }
// @keyframes gradient-move {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }

