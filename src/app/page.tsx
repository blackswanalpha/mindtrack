'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  AnimatedText,
  AnimatedCounter
} from "@/components/ui/animated-components";
import { ScrollProgress, ScrollToTop } from "@/components/ui/scroll-progress";
import { DemoNotification } from "@/components/ui/floating-notification";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <ScrollToTop />
      <DemoNotification />
      {/* Navigation */}
      <motion.nav
        className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">MindTrack</h1>
                </motion.div>
              </div>
            </div>
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Sign In</Button>
                </motion.div>
              </Link>
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">Get Started</Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <AnimatedContainer className="text-center">
            <AnimatedText delay={0.2}>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-none tracking-tight text-balance">
                Mental Health
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 block font-display">
                  Questionnaire Platform
                </span>
              </h1>
            </AnimatedText>

            <AnimatedText delay={0.4}>
              <p className="font-body text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
                Streamline mental health assessments with our comprehensive platform.
                Create, distribute, and analyze questionnaires with AI-powered insights
                for better patient care.
              </p>
            </AnimatedText>

            <AnimatedItem animation="scaleIn">
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl">
                      Start Free Trial
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/demo">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-4 text-lg font-semibold rounded-xl">
                      View Demo
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </AnimatedItem>

            {/* Trust indicators */}
            <AnimatedText delay={0.8}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500 mb-16">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </AnimatedText>

            {/* Hero Image/Dashboard Preview */}
            <AnimatedText delay={1.0}>
              <motion.div
                className="relative max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="ml-4 text-sm text-gray-500">mindtrack.app/dashboard</div>
                    </div>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Active Questionnaires</h3>
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">24</div>
                        <div className="text-sm text-green-600">+12% from last month</div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Responses Today</h3>
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">156</div>
                        <div className="text-sm text-green-600">+8% from yesterday</div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Completion Rate</h3>
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">94%</div>
                        <div className="text-sm text-green-600">+2% from last week</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">PHQ-9 Depression Screening completed by Patient #1247</span>
                          <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">GAD-7 Anxiety Assessment started by Patient #1248</span>
                          <span className="text-xs text-gray-400 ml-auto">5 min ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">New questionnaire template created: "Stress Assessment"</span>
                          <span className="text-xs text-gray-400 ml-auto">12 min ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-20"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full opacity-20"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </AnimatedText>
          </AnimatedContainer>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full opacity-30"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full opacity-30"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="font-display text-4xl font-bold text-gray-900 mb-6 tracking-tight text-balance">
                  See MindTrack in Action
                </h2>
                <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                  Discover how our intuitive interface makes mental health assessment
                  simple and efficient for healthcare professionals.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem}>
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 shadow-lg">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Create Questionnaire</h3>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                        Save & Publish
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-sm font-bold">1</div>
                          <input type="text" placeholder="Question title..." className="flex-1 border-0 text-gray-900 placeholder-gray-400 focus:ring-0" value="How often do you feel anxious?" readOnly />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-gray-50 rounded text-sm">Never</div>
                          <div className="p-2 bg-gray-50 rounded text-sm">Sometimes</div>
                          <div className="p-2 bg-gray-50 rounded text-sm">Often</div>
                          <div className="p-2 bg-indigo-100 text-indigo-700 rounded text-sm">Always</div>
                        </div>
                      </div>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-sm font-bold">2</div>
                          <input type="text" placeholder="Question title..." className="flex-1 border-0 text-gray-900 placeholder-gray-400 focus:ring-0" value="Rate your stress level (1-10)" readOnly />
                        </div>
                        <div className="flex gap-1">
                          {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                            <div key={num} className={`w-8 h-8 rounded flex items-center justify-center text-sm ${num === 7 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg p-4 text-sm font-medium hover:bg-indigo-50">
                        + Add Question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="lg:pl-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Intuitive Questionnaire Builder
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Create professional mental health assessments with our drag-and-drop interface.
                Add various question types, conditional logic, and automated scoring with ease.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Multiple question types (multiple choice, scale, text)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Conditional logic and branching</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Pre-built templates (PHQ-9, GAD-7, etc.)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Real-time preview and testing</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem} className="lg:order-2">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">Week</button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">Month</button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">Year</button>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Response Rate</span>
                        <span className="text-sm font-semibold text-gray-900">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">1,247</div>
                        <div className="text-xs text-gray-500">Total Responses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">4.2</div>
                        <div className="text-xs text-gray-500">Avg. Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">12m</div>
                        <div className="text-xs text-gray-500">Avg. Time</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Anxiety Levels</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Depression Screening</span>
                        <div className="text-sm font-medium text-gray-900">↗ 15% improvement</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="lg:order-1 lg:pr-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Powerful Analytics & Insights
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Get comprehensive insights into patient mental health trends with our advanced
                analytics dashboard. Track progress, identify patterns, and make data-driven decisions.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Real-time response tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Automated scoring and interpretation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Trend analysis and reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Export data for further analysis</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="font-display text-4xl font-bold text-gray-900 mb-6 tracking-tight text-balance">
                  Powerful Features for Mental Health Professionals
                </h2>
                <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                  Everything you need to create, manage, and analyze mental health questionnaires
                  in one comprehensive platform.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem}>
              <AnimatedCard className="group">
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-8">
                  <CardHeader className="p-0">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </motion.div>
                    <CardTitle className="font-display text-xl font-bold text-gray-900 mb-4 tracking-tight">Smart Questionnaires</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      Create adaptive questionnaires with conditional logic, multiple question types,
                      and automated scoring systems for comprehensive assessments.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AnimatedCard className="group">
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-8">
                  <CardHeader className="p-0">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-4">QR Code Access</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      Generate QR codes for instant questionnaire access. Perfect for clinical
                      settings and remote assessments with seamless patient experience.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AnimatedCard className="group">
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-8">
                  <CardHeader className="p-0">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-4">AI-Powered Analysis</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      Get intelligent insights and recommendations from AI analysis of
                      questionnaire responses and patterns for better patient outcomes.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AnimatedCard className="group">
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-8">
                  <CardHeader className="p-0">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-4">Advanced Analytics</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      Comprehensive dashboards with real-time analytics, trend analysis,
                      and detailed reporting capabilities for data-driven decisions.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AnimatedCard className="group">
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-8">
                  <CardHeader className="p-0">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-4">Smart Notifications</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      Automated email notifications, customizable templates, and
                      follow-up scheduling for enhanced patient engagement and care.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AnimatedCard className="group">
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-8">
                  <CardHeader className="p-0">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-4">Team Collaboration</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      Multi-organization support with role-based access control and
                      collaborative features designed for healthcare teams and workflows.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="font-display text-4xl font-bold text-gray-900 mb-6 tracking-tight text-balance">
                  Trusted by Healthcare Professionals Worldwide
                </h2>
                <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                  Join thousands of healthcare providers using MindTrack to improve
                  mental health assessment and patient care outcomes.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem} className="text-center">
              <motion.div
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 mb-4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  <AnimatedCounter value={10000} />+
                </div>
                <div className="text-gray-600 font-medium">Questionnaires Created</div>
              </motion.div>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <motion.div
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-green-600 mb-2">
                  <AnimatedCounter value={50000} />+
                </div>
                <div className="text-gray-600 font-medium">Responses Collected</div>
              </motion.div>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <motion.div
                className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 mb-4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  <AnimatedCounter value={500} />+
                </div>
                <div className="text-gray-600 font-medium">Healthcare Organizations</div>
              </motion.div>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <motion.div
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 mb-4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  99.9%
                </div>
                <div className="text-gray-600 font-medium">Uptime Reliability</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  What Healthcare Professionals Say
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover how MindTrack is transforming mental health assessment workflows
                  for healthcare providers worldwide.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-0 shadow-lg rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "MindTrack has revolutionized how we conduct mental health assessments. The AI insights help us identify patterns we might have missed."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    DS
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Sarah Mitchell</div>
                    <div className="text-gray-600">Clinical Psychologist</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-0 shadow-lg rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "The QR code feature makes it incredibly easy for patients to access questionnaires. Our workflow efficiency has improved by 40%."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    MJ
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Michael Johnson</div>
                    <div className="text-gray-600">Psychiatrist</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-0 shadow-lg rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "MindTrack's analytics dashboard gives us unprecedented visibility into patient mental health trends across our organization."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    EC
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Emily Chen</div>
                    <div className="text-gray-600">Mental Health Director</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="font-display text-4xl font-bold text-gray-900 mb-6 tracking-tight text-balance">
                  Simple, Transparent Pricing
                </h2>
                <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                  Choose the plan that fits your organization's needs. All plans include
                  our core features with no hidden fees.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Starter Plan */}
            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-indigo-300 transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-4 tracking-tight">Starter</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">$29</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600">Perfect for small practices</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Up to 100 responses/month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">5 questionnaire templates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Basic analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Email support</span>
                  </div>
                </div>
                <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-xl py-3">
                  Start Free Trial
                </Button>
              </Card>
            </motion.div>

            {/* Professional Plan */}
            <motion.div variants={staggerItem}>
              <Card className="h-full bg-gradient-to-br from-indigo-600 to-blue-700 border-0 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Professional</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$79</span>
                    <span className="text-indigo-200">/month</span>
                  </div>
                  <p className="text-indigo-200">Ideal for growing practices</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Up to 1,000 responses/month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Unlimited questionnaires</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Advanced analytics & AI insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Team collaboration tools</span>
                  </div>
                </div>
                <Button className="w-full bg-white text-indigo-600 hover:bg-gray-50 rounded-xl py-3 font-semibold">
                  Start Free Trial
                </Button>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-indigo-300 transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">$199</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600">For large organizations</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Unlimited responses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Custom integrations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">White-label options</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Dedicated account manager</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">24/7 phone support</span>
                  </div>
                </div>
                <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-xl py-3">
                  Contact Sales
                </Button>
              </Card>
            </motion.div>
          </motion.div>

          <AnimatedText delay={0.6}>
            <div className="text-center mt-16">
              <p className="text-gray-600 mb-4">
                All plans include a 14-day free trial. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>99.9% Uptime SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  How MindTrack Works
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Simple, powerful workflow designed for healthcare professionals
                  to streamline mental health assessments.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem} className="text-center">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-3xl font-bold text-white">1</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Questionnaires</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Build custom questionnaires with our intuitive drag-and-drop interface.
                Add various question types, conditional logic, and automated scoring.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-3xl font-bold text-white">2</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Distribute & Collect</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Share questionnaires via QR codes, email links, or direct access.
                Collect responses securely with real-time data synchronization.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-3xl font-bold text-white">3</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyze & Act</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Get AI-powered insights, generate comprehensive reports, and take
                informed actions based on advanced analytics and recommendations.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Enterprise-Grade Security & Compliance
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Your patient data is protected with industry-leading security measures
                  and full compliance with healthcare regulations.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">HIPAA Compliant</h3>
              <p className="text-gray-600">
                Full HIPAA compliance with encrypted data transmission and storage
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">256-bit Encryption</h3>
              <p className="text-gray-600">
                Bank-level encryption for all data in transit and at rest
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">SOC 2 Certified</h3>
              <p className="text-gray-600">
                Independently audited security controls and procedures
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">99.9% Uptime</h3>
              <p className="text-gray-600">
                Reliable infrastructure with guaranteed uptime SLA
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Built for Healthcare Professionals
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Role-Based Access Control</h4>
                      <p className="text-gray-600">Granular permissions for different team members and roles</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Audit Trails</h4>
                      <p className="text-gray-600">Complete logging of all user actions and data access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Data Backup & Recovery</h4>
                      <p className="text-gray-600">Automated backups with point-in-time recovery options</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Multi-Factor Authentication</h4>
                      <p className="text-gray-600">Enhanced security with 2FA and SSO integration</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Security First</h4>
                  <p className="text-gray-600 mb-6">
                    We take security seriously. Our platform is designed from the ground up
                    with healthcare data protection in mind.
                  </p>
                  <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    View Security Details
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600">
                  Get answers to common questions about MindTrack
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem}>
              <Card className="p-8 border-0 shadow-lg rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  How does MindTrack ensure HIPAA compliance?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  MindTrack is built with HIPAA compliance at its core. We use 256-bit encryption for all data
                  transmission and storage, maintain comprehensive audit logs, implement role-based access controls,
                  and undergo regular security audits. All team members are HIPAA trained and we have signed
                  Business Associate Agreements (BAAs) available.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="p-8 border-0 shadow-lg rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Can I customize questionnaires for my specific needs?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Absolutely! MindTrack offers a flexible questionnaire builder that allows you to create custom
                  assessments tailored to your practice. You can add various question types, implement conditional
                  logic, set up automated scoring, and even start from our library of validated templates like
                  PHQ-9, GAD-7, and more.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="p-8 border-0 shadow-lg rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  How do patients access and complete questionnaires?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Patients can access questionnaires through multiple methods: QR codes for in-office use,
                  email links for remote completion, or direct web links. The interface is mobile-friendly
                  and accessible, requiring no app downloads or account creation for patients.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="p-8 border-0 shadow-lg rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  What kind of analytics and reporting does MindTrack provide?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  MindTrack provides comprehensive analytics including response rates, completion times,
                  score distributions, trend analysis over time, and AI-powered insights. You can generate
                  detailed reports, export data for further analysis, and set up automated alerts for
                  concerning scores or patterns.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="p-8 border-0 shadow-lg rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Is there a limit to the number of questionnaires or responses?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Limits depend on your chosen plan. The Starter plan includes up to 100 responses per month,
                  Professional allows up to 1,000 responses, and Enterprise offers unlimited responses.
                  All plans can be upgraded at any time, and we offer custom solutions for high-volume organizations.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="p-8 border-0 shadow-lg rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Can MindTrack integrate with my existing EHR system?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! MindTrack offers integrations with popular EHR systems including Epic, Cerner, and Allscripts.
                  We also provide API access for custom integrations. Our Enterprise plan includes dedicated
                  integration support to ensure seamless workflow with your existing systems.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Integration Partners Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <AnimatedText>
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Seamless Integrations
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  MindTrack integrates with the tools you already use, making it easy to
                  incorporate mental health assessments into your existing workflow.
                </p>
              </div>
            </AnimatedText>
          </AnimatedContainer>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Integration logos - using placeholder boxes with text */}
            <motion.div variants={staggerItem} className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 w-full h-20 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">Epic</span>
              </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 w-full h-20 flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">Cerner</span>
              </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 w-full h-20 flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">Allscripts</span>
              </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 w-full h-20 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">athenahealth</span>
              </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 w-full h-20 flex items-center justify-center">
                <span className="text-lg font-bold text-indigo-600">eClinicalWorks</span>
              </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 w-full h-20 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-600">NextGen</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-0 shadow-lg rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">EHR Integration</h3>
                <p className="text-gray-600 leading-relaxed">
                  Seamlessly sync patient data and assessment results with your Electronic Health Record system.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-0 shadow-lg rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">API Access</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build custom integrations with our comprehensive REST API and webhook support.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="h-full bg-white border-0 shadow-lg rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">SSO Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Single Sign-On integration with Active Directory, SAML, and popular identity providers.
                </p>
              </Card>
            </motion.div>
          </motion.div>

          <AnimatedText delay={0.8}>
            <div className="text-center mt-16">
              <p className="text-gray-600 mb-6">
                Don't see your system listed? We're constantly adding new integrations.
              </p>
              <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-xl">
                Request Integration
              </Button>
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedContainer>
            <AnimatedText>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight text-balance">
                Ready to Transform Mental Health Assessment?
              </h2>
            </AnimatedText>

            <AnimatedText delay={0.2}>
              <p className="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto">
                Join healthcare professionals worldwide who trust MindTrack for
                comprehensive mental health questionnaire management and better patient outcomes.
              </p>
            </AnimatedText>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg">
                    Start Your Free Trial
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-semibold rounded-xl">
                    Schedule a Demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <AnimatedText delay={0.6}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-indigo-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </AnimatedText>
          </AnimatedContainer>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-white tracking-tight">MindTrack</h3>
              </div>
              <p className="text-gray-400 mb-8 max-w-md text-lg leading-relaxed">
                Comprehensive mental health questionnaire management platform
                designed for healthcare professionals and organizations worldwide.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-lg">
              © 2024 MindTrack. All rights reserved.
            </p>
            <div className="flex space-x-8 mt-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-lg transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-lg transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-lg transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
