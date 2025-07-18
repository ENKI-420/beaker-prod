'use client';

import React from 'react';
import { FeatureCard } from '../components/feature-card';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Clinical Dashboard',
    description: 'View real-time clinical data and patient summaries.',
    href: '/components/dashboard/clinical-dashboard',
    icon: '🩺',
  },
  {
    title: 'Genomics',
    description: 'Upload and visualize genomic data and variants.',
    href: '/components/genomics/genomic-variant-viewer',
    icon: '🧬',
  },
  {
    title: 'Lab Results',
    description: 'Access and review lab results panels.',
    href: '/components/lab/lab-results-panel',
    icon: '🧪',
  },
  {
    title: 'File Uploader',
    description: 'Upload, view, and manage files securely.',
    href: '/components/blob/file-uploader',
    icon: '📁',
  },
  {
    title: 'Task Queue',
    description: 'Monitor and manage background tasks.',
    href: '/components/tasks/task-queue',
    icon: '📋',
  },
  {
    title: 'Redis Metrics',
    description: 'Visualize Redis metrics and connection pools.',
    href: '/components/redis/metrics-dashboard',
    icon: '📊',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 dark:text-white mb-4 animate-fade-in">
          Welcome to <span className="text-blue-600 dark:text-cyan-400">Beaker</span>
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          A modern platform for clinical, genomic, and operational data exploration.
        </p>
        <a
          href="#features"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 dark:hover:bg-cyan-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400"
          aria-label="Get started with Beaker"
        >
          Get Started
        </a>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}

