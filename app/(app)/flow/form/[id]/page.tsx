'use client';

import React, { useEffect, useState, use } from 'react';
import { Send, CheckCircle2, Upload as UploadIcon, X as XIcon, ChevronDown } from 'lucide-react';
import { FormsService } from '@/lib/services/forms';
import { Forms } from '@/generated/appwrite/types';
import { useDataNexus } from '@/context/DataNexusContext';
import { secureUploadFile } from '@/lib/actions/client-ops';
import { APPWRITE_CONFIG } from '@/lib/appwrite/config';

export default function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { fetchOptimized } = useDataNexus();
    const [form, setForm] = useState<Forms | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                if (!resolvedParams?.id) {
                    setError('Invalid form reference.');
                    return;
                }

                const user = await FormsService.getCurrentUser();
                setCurrentUser(user);

                const data = await fetchOptimized(`f_form_schema_${resolvedParams.id}`, () => 
                    FormsService.getForm(resolvedParams.id)
                );
                
                let settings: any = {};
                try {
                    settings = JSON.parse(data.settings || '{}');
                } catch (_e) {}

                const isOwner = user?.$id === data.userId;

                if (!isOwner && data.status !== 'published' && data.isPublic !== true) {
                    setError('This form is private and not currently accepting public submissions.');
                    return;
                }

                if (!isOwner && settings.expiresAt && new Date(settings.expiresAt) < new Date()) {
                    setError('This form has expired and is no longer accepting responses.');
                    return;
                }

                setForm(data);

                // Load existing draft/local data
                const localKey = `form_draft_${resolvedParams.id}`;
                const localData = localStorage.getItem(localKey);
                if (localData && localData !== 'undefined') {
                    try {
                        setFormData(JSON.parse(localData));
                    } catch (_e) {}
                }

                // If logged in, prioritize DB draft if exists
                if (user) {
                    try {
                        const draft = await FormsService.getDraft(resolvedParams.id, user.$id);
                        if (draft && draft.payload) {
                            try {
                                setFormData(JSON.parse(draft.payload));
                            } catch (parseErr) {
                                console.warn("[Form] Remote draft payload invalid JSON", parseErr);
                            }
                        }
                    } catch (_e) {
                        console.error("Failed to check for remote draft", _e);
                    }
                }

            } catch (err: any) {
                setError(err.message || 'Form not found or inaccessible.');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [resolvedParams.id, fetchOptimized]);

    // Autosave logic
    useEffect(() => {
        if (!form || Object.keys(formData).length === 0 || submitted) return;

        const timer = setTimeout(async () => {
            // Local save
            const localKey = `form_draft_${resolvedParams.id}`;
            localStorage.setItem(localKey, JSON.stringify(formData));

            // Remote save if logged in
            if (currentUser) {
                try {
                    await FormsService.saveDraft(resolvedParams.id, JSON.stringify(formData), currentUser.$id);
                } catch (_e) {
                    console.error("Autosave failed", _e);
                }
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [formData, resolvedParams.id, currentUser, form, submitted]);

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
        const currentValues = formData[fieldId] || [];
        const nextValues = checked 
            ? [...currentValues, option]
            : currentValues.filter((v: string) => v !== option);
        handleFieldChange(fieldId, nextValues);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await FormsService.submitForm(resolvedParams.id, JSON.stringify(formData));
            setSubmitted(true);
            // Clear local draft
            localStorage.removeItem(`form_draft_${resolvedParams.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#050505]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6366F1] border-t-transparent" />
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="max-w-md w-full mx-auto px-4 py-20 font-satoshi">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-[#ff1744] rounded-2xl font-semibold text-center leading-relaxed">
                    {error}
                </div>
            </div>
        );
    }

    let schema: any[] = [];
    try { schema = JSON.parse(form?.schema || '[]'); } catch (_e) {}

    const renderField = (field: any) => {
        switch (field.type) {
            case 'select':
                return (
                    <div className="relative">
                        <select
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                            className="w-full px-4.5 py-3.5 rounded-xl bg-[#0B0A09] border border-[#34322F] text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 hover:border-[#6366F1] transition-all cursor-pointer font-satoshi text-sm md:text-base appearance-none"
                        >
                            <option value="" disabled hidden>Select an option</option>
                            {(field.options || []).map((opt: string) => (
                                <option key={opt} value={opt} className="bg-[#161412] text-white font-satoshi">{opt}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                );
            case 'radio':
                return (
                    <div className="grid gap-3 pl-1">
                        {(field.options || []).map((opt: string) => (
                            <label key={opt} className="flex items-center gap-3 cursor-pointer group select-none">
                                <input 
                                    type="radio" 
                                    name={field.id}
                                    value={opt}
                                    checked={formData[field.id] === opt}
                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                    className="w-5 h-5 text-[#6366F1] bg-[#0B0A09] border border-[#34322F] focus:ring-0 focus:ring-offset-0 focus:outline-none checked:bg-[#6366F1] checked:border-[#6366F1] transition-all cursor-pointer"
                                />
                                <span className="text-sm md:text-base font-satoshi text-zinc-300 group-hover:text-white transition-colors">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="grid gap-3 pl-1">
                        {(field.options || []).map((opt: string) => (
                            <label key={opt} className="flex items-center gap-3 cursor-pointer group select-none">
                                <input 
                                    type="checkbox"
                                    checked={(formData[field.id] || []).includes(opt)}
                                    onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                    className="w-5 h-5 text-[#6366F1] bg-[#0B0A09] border border-[#34322F] rounded focus:ring-0 focus:ring-offset-0 focus:outline-none checked:bg-[#6366F1] checked:border-[#6366F1] transition-all cursor-pointer"
                                />
                                <span className="text-sm md:text-base font-satoshi text-zinc-300 group-hover:text-white transition-colors">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'textarea':
                return (
                    <textarea
                        rows={4}
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4.5 py-3.5 rounded-xl bg-[#0B0A09] border border-[#34322F] text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 hover:border-[#6366F1] transition-all resize-y font-satoshi leading-relaxed text-sm md:text-base"
                        placeholder="Type your response here..."
                    />
                );
            case 'file':
                const selectedFile = formData[field.id];
                return (
                    <div className="flex flex-col gap-2.5">
                        {selectedFile ? (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B0A09] border border-[#34322F] transition-all">
                                <div className="flex items-center gap-3 min-w-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <span className="text-sm font-semibold text-zinc-200 truncate max-w-[280px] font-satoshi">
                                        {selectedFile.originalName || 'File uploaded'}
                                    </span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => handleFieldChange(field.id, null)} 
                                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <XIcon size={18} />
                                </button>
                            </div>
                        ) : (
                            <label
                                className={`w-full py-4 px-4.5 rounded-xl border border-dashed border-[#34322F] bg-[#1C1A18] hover:bg-[#34322F]/20 hover:border-[#6366F1] transition-all cursor-pointer flex items-center justify-center gap-2.5 text-sm font-bold text-zinc-400 hover:text-white font-satoshi ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                ) : (
                                    <UploadIcon size={18} />
                                )}
                                <span>{submitting ? 'Uploading...' : 'Choose File (Max 5MB)'}</span>
                                {!submitting && (
                                    <input
                                        type="file"
                                        className="hidden"
                                        required={field.required && !selectedFile}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            if (file.size > 5 * 1024 * 1024) {
                                                alert('File exceeds 5MB limit.');
                                                return;
                                            }
                                            setSubmitting(true);
                                            try {
                                                const fData = new FormData();
                                                fData.append('file', file);
                                                fData.append('bucketId', APPWRITE_CONFIG.BUCKETS.FORM_ATTACHMENTS);
                                                const uploaded = await secureUploadFile(fData);
                                                handleFieldChange(field.id, {
                                                    fileId: uploaded.$id,
                                                    bucketId: APPWRITE_CONFIG.BUCKETS.FORM_ATTACHMENTS,
                                                    originalName: file.name
                                                });
                                            } catch (err: any) {
                                                alert(err.message || 'Failed to upload file.');
                                            } finally {
                                                setSubmitting(false);
                                            }
                                        }}
                                    />
                                )}
                            </label>
                        )}
                    </div>
                );
            default:
                return (
                    <input
                        type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-[#0B0A09] border border-[#34322F] text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 hover:border-[#6366F1] transition-all font-satoshi text-sm md:text-base"
                        placeholder="Type response..."
                    />
                );
        }
    };

    return (
        <div 
            className="min-h-screen bg-[#000000] text-white flex flex-col items-center"
            style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)' }}
        >
            <div className="max-w-xl w-full mx-auto px-4 py-12 md:py-24">
                <div>
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold font-clash text-white tracking-tight leading-tight">
                            {form?.title}
                        </h1>
                        {form?.description && (
                            <p className="text-zinc-400 font-satoshi font-normal leading-relaxed text-sm md:text-base mt-3 max-w-lg mx-auto">
                                {form.description}
                            </p>
                        )}

                        <div className="mt-6 flex justify-center">
                            <div className="px-3.5 py-1.5 rounded-full bg-[#1C1A18] border border-[#34322F] flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                                <span className="text-xs font-bold text-zinc-300 font-mono tracking-wider">
                                    {currentUser ? `Filling as ${currentUser.name || currentUser.email}` : 'Filling anonymously'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {submitted ? (
                        <div className="p-8 md:p-16 text-center rounded-[28px] bg-[#161412] border border-[#34322F] flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8 text-[#6366F1]" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold font-clash text-white mb-3">Transmission Complete</h2>
                            <p className="text-[#9B9691] mb-8 font-medium font-satoshi text-sm md:text-base">
                                Your data has been securely injected into the Kylrix Flow nexus.
                            </p>
                            <button 
                                type="button" 
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 rounded-xl border border-[#34322F] text-white font-bold hover:bg-[#1C1A18] hover:border-[#6366F1] hover:text-white transition-all font-satoshi text-sm"
                            >
                                Submit New Entry
                            </button>
                        </div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit}
                            className="p-6 md:p-10 rounded-[28px] bg-[#161412] border border-[#34322F] flex flex-col gap-6"
                        >
                            <div className="flex flex-col gap-8">
                                {schema.map((field) => (
                                    <div key={field.id} className="flex flex-col gap-2.5">
                                        <label className="block text-sm font-bold text-zinc-200 font-satoshi tracking-wide">
                                            {field.label} {field.required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
                                        </label>
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-[#ff1744] rounded-xl text-sm font-semibold font-satoshi leading-relaxed text-center mt-2">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-6 w-full py-4 px-6 rounded-xl font-bold bg-[#6366F1] text-zinc-950 hover:bg-[#5254E8] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg font-clash tracking-wide"
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-950 border-t-transparent" />
                                ) : (
                                    <Send size={18} />
                                )}
                                <span>{submitting ? 'Transmitting...' : 'Commit Response'}</span>
                            </button>
                        </form>
                    )}

                    <div className="mt-10 text-center opacity-25">
                        <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.3em] text-[#9B9691]">
                            Secured by Kylrix Neural Flow
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
