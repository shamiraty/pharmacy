'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, ArrowRight, Shield, TrendingUp, Users, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <Pill className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            PharmaCare
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Complete Pharmacy Management & Inventory System
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-white/20 transition-all">
            <Shield className="w-12 h-12 mb-4 text-primary-200" />
            <h3 className="text-2xl font-bold mb-3">Secure & Reliable</h3>
            <p className="text-primary-100">
              Advanced security features to protect your sensitive pharmacy data
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-white/20 transition-all">
            <TrendingUp className="w-12 h-12 mb-4 text-primary-200" />
            <h3 className="text-2xl font-bold mb-3">Advanced Analytics</h3>
            <p className="text-primary-100">
              Comprehensive reports and real-time analytics for better decisions
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-white/20 transition-all">
            <Users className="w-12 h-12 mb-4 text-primary-200" />
            <h3 className="text-2xl font-bold mb-3">Easy to Use</h3>
            <p className="text-primary-100">
              Intuitive interface designed for pharmacy staff of all levels
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-primary-700 rounded-xl hover:bg-primary-50 transition-all text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-primary-200">
          <p>&copy; 2024 PharmaCare. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
