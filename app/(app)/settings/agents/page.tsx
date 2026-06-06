'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft,
    Lock, 
    Shield, 
    Key,
    Bot,
    Cpu,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    RotateCcw,
    X,
    CheckCircle2
} from 'lucide-react';
import { ecosystemSecurity } from '@/lib/ecosystem/security';
import { useAuth } from '@/lib/auth';
import { useSudo } from '@/context/SudoContext';
import { toast } from 'react-hot-toast';
import { BYOKManager } from '@/lib/ai/byok';

// Standard Brand Colors
const BRAND_INDIGO = '#6366F1';
const BRAND_EMERALD = '#10B981';
const VOID = '#0A0908';
const SURFACE_ASH = '#161412';
const INSET_ASH = '#1C1A18';
const BORDER_SOFT = 'rgba(255,255,255,0.06)';

export default function AssistantSettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { promptSudo } = useSudo();
    
    // Unified vault state
    const [isUnlocked, setIsUnlocked] = useState(ecosystemSecurity.status.isUnlocked);
    
    // Private AI Key state
    const [byokKeyInput, setByokKeyInput] = useState('');
    const [hasByok, setHasByok] = useState(false);
    const [byokLoading, setByokLoading] = useState(true);
    const [byokSaving, setByokSaving] = useState(false);
    const [showByokInput, setShowByokInput] = useState(false);

    // Framework state
    const [selectedFramework, setSelectedFramework] = useState('kylrix');

    const handleBack = () => {
        router.push('/settings');
    };

    const handleUnlockVault = async () => {
        const success = await promptSudo('unlock');
        if (success) {
            toast.success("Security vault unlocked successfully!");
        }
    };

    const handleSaveByok = async () => {
        if (!user?.$id) return;
        if (!byokKeyInput.trim()) {
            toast.error("Please enter a valid API Key.");
            return;
        }

        setByokSaving(true);
        try {
            await BYOKManager.saveKey(user.$id, 'gemini', byokKeyInput.trim());
            toast.success("Private AI key saved and encrypted successfully!");
            setHasByok(true);
            setByokKeyInput('');
            setShowByokInput(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to encrypt and save private key.");
        } finally {
            setByokSaving(false);
        }
    };

    const handleDeleteByok = async () => {
        if (!user?.$id) return;
        if (!window.confirm("Are you sure you want to remove your private AI key? Automated assistants will fall back to default keys.")) return;

        setByokSaving(true);
        try {
            await BYOKManager.deleteKey(user.$id, 'gemini');
            toast.success("Private AI key removed.");
            setHasByok(false);
            setByokKeyInput('');
            setShowByokInput(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to remove private key.");
        } finally {
            setByokSaving(false);
        }
    };

    useEffect(() => {
        const unsubscribe = ecosystemSecurity.onStatusChange((status) => {
            if (status.isUnlocked !== isUnlocked) {
                setIsUnlocked(status.isUnlocked);
            }
        });

        if (user?.$id && isUnlocked) {
            setByokLoading(true);
            BYOKManager.hasKey(user.$id, 'gemini')
                .then((present) => {
                    setHasByok(present);
                    setByokLoading(false);
                })
                .catch(() => setByokLoading(false));
        } else {
            setByokLoading(false);
        }

        return () => {
            unsubscribe();
        };
    }, [isUnlocked, user?.$id]);

    return (
        <div className="max-w-[840px] mx-auto pt-4 md:pt-6 pb-8 md:pb-12 px-4 md:px-6 bg-[#0A0908] min-h-screen text-white font-satoshi relative z-10 selection:bg-[#6366F1]/30">
            
            {/* Header Navigation */}
            <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-white/10 text-white/70 font-extrabold text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/20 transition-all active:scale-[0.98]"
            >
                <ArrowLeft size={14} strokeWidth={3} />
                <span>Back to Control Panel</span>
            </button>

            {/* Page Title Section */}
            <header className="mb-10">
                <span className="block text-[#9B9691] font-black text-[10px] uppercase tracking-[0.2em] font-mono mb-2">
                    System Configuration
                </span>
                <h1 className="text-3xl md:text-4xl font-black font-clash text-white tracking-tight leading-none uppercase">
                    Assistant Settings
                </h1>
                <p className="text-[#9B9691] mt-3 max-w-[560px] text-sm md:text-base font-semibold leading-relaxed">
                    Configure private keys, automated assistant systems, and resource allocations for your agentic node.
                </p>
            </header>

            <div className="flex flex-col gap-8">
                
                {/* 🚀 Assistants Workspace Gateway */}
                <button
                    onClick={() => router.push('/agents')}
                    className="group w-full text-left bg-[#161412] border border-white/8 rounded-[32px] p-6 md:p-8 flex items-center justify-between transition-all duration-500 hover:border-[#6366F1]/40 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(99,102,241,0.25)] active:scale-[0.99] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            <Bot size={28} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex flex-col gap-0.5">
                            <h3 className="text-white font-black text-lg md:text-xl font-clash uppercase tracking-tight leading-tight">
                                Go to Assistants Workspace
                            </h3>
                            <p className="text-[#9B9691] text-xs md:text-sm font-semibold leading-relaxed group-hover:text-white/60 transition-colors">
                                Launch, audit, and coordinate your active smart assistants.
                            </p>
                        </div>
                    </div>
                    <ArrowUpRight size={22} className="text-white/20 group-hover:text-[#6366F1] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 flex-shrink-0" />
                </button>

                {/* 🛡️ Vault & Keys Section */}
                <section className="bg-[#161412] border border-white/6 rounded-[32px] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Shield size={20} className="text-[#6366F1]" />
                            <h2 className="text-white font-black text-base md:text-lg font-clash uppercase tracking-tight">Security Vault & Credentials</h2>
                        </div>
                        <p className="text-[#9B9691] text-xs md:text-sm font-semibold leading-relaxed">
                            To protect your sensitive credentials, private keys are encrypted locally within your security vault before persistence.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Vault Access Row */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1C1A18] border border-white/5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUnlocked ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#6366F1]/10 text-[#6366F1]'}`}>
                                {isUnlocked ? <CheckCircle2 size={20} /> : <Lock size={20} />}
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                <span className="text-white font-black text-sm uppercase">Vault Access</span>
                                <span className="text-[#9B9691] text-[11px] font-bold uppercase tracking-wider">
                                    {isUnlocked ? "Unlocked - private keys accessible" : "Locked - unlock to view or edit keys"}
                                </span>
                            </div>
                            <button
                                onClick={isUnlocked ? undefined : handleUnlockVault}
                                disabled={isUnlocked}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                    isUnlocked 
                                    ? 'bg-transparent border border-white/10 text-white/40 cursor-default' 
                                    : 'bg-[#6366F1] text-white hover:bg-[#5254E8] active:scale-[0.95]'
                                }`}
                            >
                                {isUnlocked ? "Active" : "Unlock"}
                            </button>
                        </div>

                        <div className="h-px bg-white/5 w-full my-2" />

                        {/* Private AI Key Configuration */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center flex-shrink-0">
                                        <Key size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-white font-black text-sm uppercase">Private AI Key (Gemini)</h4>
                                        <p className="text-[#9B9691] text-[11px] font-bold uppercase tracking-wider mt-0.5">Power assistants using a personal API key</p>
                                    </div>
                                </div>
                                {hasByok && !showByokInput && (
                                    <button 
                                        onClick={handleDeleteByok}
                                        disabled={byokSaving}
                                        className="text-[#EF4444] font-black text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors disabled:opacity-50"
                                    >
                                        Remove Key
                                    </button>
                                )}
                            </div>

                            {byokLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 size={24} className="text-[#6366F1] animate-spin" />
                                </div>
                            ) : !isUnlocked ? (
                                <div className="p-5 rounded-2xl bg-[#0A0908] border border-white/5 text-center">
                                    <p className="text-[#9B9691] text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        Unlock your security vault with MasterPass to configure or rotate private keys.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 animate-fadeIn">
                                    {hasByok && !showByokInput ? (
                                        <div className="p-4 rounded-2xl bg-[#0A0908] border border-white/8 flex items-center justify-between gap-4">
                                            <span className="text-[#10B981] font-mono text-[11px] font-black tracking-widest truncate">
                                                •••••••••••••••••••••••••••••••• (Encrypted in local vault)
                                            </span>
                                            <button 
                                                onClick={() => setShowByokInput(true)}
                                                className="text-[#6366F1] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-[#6366F1]/5 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                Rotate Key
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="password"
                                                placeholder="Enter Gemini API Key (AIzaSy...)"
                                                value={byokKeyInput}
                                                onChange={(e) => setByokKeyInput(e.target.value)}
                                                className="flex-1 bg-[#0A0908] text-white border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold font-mono focus:outline-none focus:border-[#6366F1] transition-all placeholder:text-white/20"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveByok}
                                                    disabled={byokSaving || !byokKeyInput.trim()}
                                                    className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#6366F1] text-black font-black text-xs uppercase tracking-widest hover:bg-[#5254E8] active:scale-[0.95] disabled:opacity-50 transition-all min-w-[100px] flex items-center justify-center gap-2"
                                                >
                                                    {byokSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Key"}
                                                </button>
                                                {hasByok && (
                                                    <button
                                                        onClick={() => setShowByokInput(false)}
                                                        className="px-4 py-3.5 rounded-xl bg-white/3 border border-white/10 text-white/50 font-black text-xs uppercase tracking-widest hover:text-white hover:bg-white/6 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 🏗️ Assistant Systems Selection */}
                <section className="bg-[#161412] border border-white/6 rounded-[32px] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Cpu size={20} className="text-[#6366F1]" />
                            <h2 className="text-white font-black text-base md:text-lg font-clash uppercase tracking-tight">Assistant Systems Architecture</h2>
                        </div>
                        <p className="text-[#9B9691] text-xs md:text-sm font-semibold leading-relaxed">
                            Select the technology stack that manages and routes your background automated processes.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {[
                            { id: 'kylrix', title: 'Kylrix Internal', desc: 'Core native framework optimized for task tracking and calendar automation.', status: 'Active' },
                            { id: 'openclaw', title: 'OpenClaw Platform', desc: 'Compatibility layers for external tools and third-party task agents.', status: 'Coming Soon' },
                            { id: 'hermes', title: 'Hermes Orchestrator', desc: 'Lightweight, rapid response chat and dialogue flow coordinator.', status: 'Coming Soon' }
                        ].map((fw) => {
                            const isActive = fw.status === 'Active';
                            const isSelected = selectedFramework === fw.id;

                            return (
                                <button 
                                    key={fw.id}
                                    onClick={() => isActive && setSelectedFramework(fw.id)}
                                    disabled={!isActive}
                                    className={`group w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 text-left ${
                                        isSelected 
                                        ? 'bg-[#1C1A18] border-[#6366F1]/30 shadow-[0_8px_30px_rgba(99,102,241,0.1)]' 
                                        : 'bg-[#1C1A18] border-white/5 opacity-60'
                                    } ${isActive ? 'hover:border-white/20 hover:opacity-100' : 'cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                            isSelected ? 'border-[#6366F1]' : 'border-white/10 group-hover:border-white/30'
                                        }`}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />}
                                        </div>
                                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                            <span className={`text-white font-black text-sm uppercase transition-colors ${isSelected ? 'text-[#6366F1]' : ''}`}>
                                                {fw.title}
                                            </span>
                                            <span className="text-[#9B9691] text-[11px] font-bold leading-relaxed truncate">
                                                {fw.desc}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${
                                        isActive 
                                        ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' 
                                        : 'bg-white/5 text-white/30 border border-white/5'
                                    }`}>
                                        {fw.status}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 🏗️ System Load & Scaling Placeholder */}
                <div className="p-4 border-t border-white/4 bg-transparent flex items-center gap-3 mt-4">
                    <div className="relative flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="block text-white/20 font-black text-[9px] uppercase tracking-[0.15em] font-mono truncate">
                            Ecosystem Node: Assistant Routing Layer Active (v2.4.1)
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
