'use client';

import React, { useState, useEffect } from 'react';
import TaskList from '@/components/tasks/TaskList';
import FormsDashboard from './forms/page';
import EventList from '@/components/events/EventList';
import { useFAB } from '@/context/FABContext';
import { Plus } from 'lucide-react';

export default function FlowDashboardPage() {
  const [activeTab, setActiveTab] = useState<'goals' | 'forms' | 'events'>('goals');
  const { resetConfiguration } = useFAB();

  // Reset FAB when switching tabs to let the active tab component configure its own FAB
  useEffect(() => {
    resetConfiguration();
  }, [activeTab, resetConfiguration]);

  return (
    <div className="min-h-screen bg-[#0A0908] text-white/90 font-satoshi relative overflow-x-hidden pt-4 md:pt-8 px-4 md:px-6">
      {/* Spotlight ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[300px] bg-gradient-to-b from-purple-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit select-none mb-8">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'goals'
                ? 'bg-[#A855F7] text-white shadow-[0_4px_12px_rgba(168,85,247,0.25)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'forms'
                ? 'bg-[#A855F7] text-white shadow-[0_4px_12px_rgba(168,85,247,0.25)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Forms
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'events'
                ? 'bg-[#A855F7] text-white shadow-[0_4px_12px_rgba(168,85,247,0.25)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Events
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'goals' && <TaskList />}
        {activeTab === 'forms' && <FormsDashboard />}
        {activeTab === 'events' && <EventList />}
      </div>
    </div>
  );
}
