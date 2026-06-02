"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Stack, 
  alpha, 
  CircularProgress,
  Avatar
} from '@/lib/mui-tailwind/material';
import {
  VpnKey as VpnKeyIcon,
  Shield as ShieldIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  ChevronRight as ChevronRightIcon,
} from '@/lib/mui-tailwind/icons';
import { useAppwriteVault } from '@/context/appwrite-context';
import {
  appwriteDatabases,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_TOTPSECRETS_ID,
  Query,
  AppwriteService,
} from '@/lib/appwrite';
import { masterPassCrypto } from '@/lib/masterpass-crypto';
import { useDataNexus } from '@/context/DataNexusContext';

export default function OverviewPage() {
  const { user } = useAppwriteVault();
  const { fetchOptimized } = useDataNexus();
  const [stats, setStats] = useState({ totalCreds: 0, totpCount: 0 });
  const [recent, setRecent] = useState<
    Array<{ $id: string; name: string; username?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [dupGroups, setDupGroups] = useState<
    Array<{ key: string; count: number; fields: string[]; ids: string[] }>
  >([]);

  const locked = useMemo(() => !masterPassCrypto.isVaultUnlocked(), []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      try {
        const credsResp = await fetchOptimized(`v_creds_total_${user.$id}`, () =>
          AppwriteService.listCredentials(
            user.$id,
            1,
            0,
            [Query.orderDesc("$updatedAt")],
          )
        );

        let totpCount = 0;
        try {
          const totpResp = await fetchOptimized(`v_totp_total_${user.$id}`, () =>
            appwriteDatabases.listDocuments(
              APPWRITE_DATABASE_ID,
              APPWRITE_COLLECTION_TOTPSECRETS_ID,
              [Query.equal("userId", user.$id), Query.limit(1)],
            )
          );
          totpCount =
            (
              totpResp as {
                total?: number;
                documents: Array<Record<string, unknown>>;
                rows: Array<Record<string, unknown>>;
              }
            ).total ?? totpResp.rows.length;
        } catch {
        }

        const credsTyped = credsResp as {
          total?: number;
          documents?: Array<Record<string, unknown>>;
          rows?: Array<Record<string, unknown>>;
        };
        const totalCreds = credsTyped.total ?? credsTyped.rows?.length ?? 0;

        let dupGroupsLocal: Array<{
          key: string;
          count: number;
          fields: string[];
          ids: string[];
        }> = [];
        try {
          const windowSize = Math.min(50, totalCreds);
          const recentWindow = await fetchOptimized(`v_recent_creds_window_${user.$id}`, () =>
            AppwriteService.listCredentials(
              user.$id,
              windowSize,
              0,
              [Query.orderDesc("$updatedAt")],
            )
          );
          const recentWindowTyped = recentWindow as {
            documents?: any[];
            rows?: any[];
          };
          const items = recentWindowTyped.rows || [];

          const fieldCandidates = [
            "username",
            "password",
            "url",
            "notes",
            "customFields"];
          const fieldsPresent = fieldCandidates.filter((f) =>
            items.some((it) => {
              const val = (it as Record<string, unknown>)[f];
              return val != null && String(val).trim() !== "";
            }),
          );
          const groups = new Map<string, { ids: string[] }>();

          const normalize = (v: unknown) => {
            if (v == null) return "";
            if (typeof v === "string") return v.trim().toLowerCase();
            try {
              return JSON.stringify(v);
            } catch {
              return String(v);
            }
          };

          for (const it of items) {
            const sigObj: Record<string, unknown> = {};
            for (const f of fieldsPresent)
              sigObj[f] = normalize((it as Record<string, unknown>)[f]);
            const signature = JSON.stringify(sigObj);
            const entry = groups.get(signature) || { ids: [] };
            entry.ids.push(String((it as Record<string, unknown>)["$id"]));
            groups.set(signature, entry);
          }

          dupGroupsLocal = Array.from(groups.entries())
            .filter(([, v]) => v.ids.length > 1)
            .map(([k, v]) => ({
              key: k,
              count: v.ids.length,
              fields: fieldsPresent,
              ids: v.ids,
            }));
        } catch {}

        let recentItems: Array<{
          $id: string;
          name: string;
          username?: string;
        }> = [];
        try {
          const recentDocs = (await AppwriteService.listRecentCredentials(
            user.$id,
            5,
          )) as Array<Record<string, unknown>>;
          recentItems = recentDocs.map((d) => ({
            $id: String(d.$id as unknown as string),
            name: (d.name as string) ?? (d.title as string) ?? "Untitled",
            username: d.username as string | undefined,
          }));
        } catch {
          const credsTyped2 = credsResp as { documents?: any[], rows?: any[] };
          recentItems = (credsTyped2.rows || [])
            .slice(0, 5)
            .map((d) => ({
              $id: String((d as Record<string, unknown>)["$id"]),
              name:
                ((d as Record<string, unknown>)["name"] as string) ??
                ((d as Record<string, unknown>)["title"] as string) ??
                "Untitled",
              username: (d as Record<string, unknown>)["username"] as
                | string
                | undefined,
            }));
        }

        if (!cancelled) {
          setStats({ totalCreds, totpCount });
          setRecent(locked ? [] : recentItems);
          setDupGroups(locked ? [] : dupGroupsLocal);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    user,
    locked,
    fetchOptimized]);

  if (!user) return null;

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      bgcolor: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      p: { xs: 2, md: 4 }
    }}>
      <Box sx={{ width: '100%', maxWidth: '1100px' }}>
        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          spacing={2}
          sx={{ mb: 5 }}
        >
          <Box>
            <Typography component="span" variant="h4" sx={{ 
              display: 'block',
              fontWeight: 900, 
              fontFamily: 'var(--font-clash)',
              letterSpacing: '-0.04em',
              mb: 0.5,
              lineHeight: 1.2,
            }}>
              Overview
            </Typography>
            <Typography component="span" variant="body2" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500, lineHeight: 1.45 }}>
              A quick snapshot of your secure vault.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button 
              component={Link}
              href="/credentials/new"
              variant="contained" 
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              sx={{ 
                borderRadius: '14px', 
                px: 3, 
                py: 1.2, 
                fontWeight: 800,
                bgcolor: '#6366F1',
                color: '#000',
                '&:hover': { bgcolor: alpha('#6366F1', 0.8) }
              }}
            >
              Add Credential
            </Button>
            <Button 
              component={Link}
              href="/import"
              variant="outlined" 
              startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
              sx={{ 
                borderRadius: '14px', 
                px: 3, 
                py: 1.2, 
                fontWeight: 700,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:hover': { borderColor: 'rgba(255, 255, 255, 0.2)', bgcolor: 'rgba(255, 255, 255, 0.05)' }
              }}
            >
              Import
            </Button>
          </Stack>
        </Stack>

        {locked && (
          <Paper sx={{ 
            p: 2.5, 
            mb: 4, 
            borderRadius: '20px', 
            bgcolor: alpha('#FFB000', 0.05),
            border: '1px solid',
            borderColor: alpha('#FFB000', 0.2),
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <WarningIcon sx={{ fontSize: 24, color: "#FFB000" }} />
            <Typography variant="body2" sx={{ color: '#FFB000', fontWeight: 600 }}>
              Your vault is locked. Unlock to view full statistics and recent activity.
            </Typography>
          </Paper>
        )}

        {/* Stats Grid — fluid auto-fill (see ui.tailwind-fix) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
            gap: 3,
            mb: 4,
            width: '100%',
          }}
        >
          {[
            { label: 'Total Credentials', value: stats.totalCreds, icon: VpnKeyIcon, color: '#6366F1' },
            { label: 'TOTP Codes', value: stats.totpCount, icon: ShieldIcon, color: '#10B981' },
            { label: 'Recent Activity', value: Math.min(stats.totalCreds, 5), icon: AccessTimeIcon, color: '#A855F7' },
            { label: 'Security Alerts', value: 0, icon: WarningIcon, color: '#F59E0B' },
          ].map((stat, i) => (
            <Paper
              key={i}
              sx={{
                p: 2.5,
                borderRadius: '24px',
                bgcolor: '#161412',
                border: '1px solid #34322F',
                backgroundImage: 'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
                transition: 'border-color 0.2s ease',
                '&:hover': { borderColor: alpha(stat.color, 0.35) },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35, minWidth: 0 }}>
                <Typography
                  component="span"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    lineHeight: 1.25,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontWeight: 900, fontFamily: 'var(--font-clash)', letterSpacing: '-0.02em', fontSize: '1.75rem', lineHeight: 1.15 }}
                >
                  {loading ? <CircularProgress size={20} thickness={6} sx={{ color: 'rgba(255, 255, 255, 0.2)' }} /> : stat.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: alpha(stat.color, 0.08),
                  border: `1px solid ${alpha(stat.color, 0.15)}`,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <stat.icon sx={{ fontSize: 20, color: stat.color }} />
              </Box>
            </Paper>
          ))}
        </Box>

        <Grid container spacing={3}>
          {/* Recent Items */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: '28px', 
              bgcolor: '#161412',
              border: '1px solid #34322F',
              backgroundImage: 'none',
              height: '100%',
            }}>
              <Typography component="span" variant="h6" sx={{ display: 'block', fontWeight: 900, mb: 2.5, fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.25 }}>
                Recent Items
              </Typography>
              <Stack spacing={1.5}>
                {loading ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress size={32} sx={{ color: '#6366F1' }} />
                  </Box>
                ) : recent.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)', py: 4, textAlign: 'center' }}>
                    No items found in your vault.
                  </Typography>
                ) : (
                  recent.map((item) => (
                    <Box 
                      key={item.$id}
                      component={Link}
                      href={`/dashboard?focus=${item.$id}`}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        px: 2.25,
                        py: 1.5,
                        borderRadius: '18px',
                        bgcolor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid transparent',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#6366F1',
                        flexShrink: 0,
                      }}>
                        {item.name?.[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                        <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.25 }} noWrap>{item.name}</Typography>
                        {item.username && (
                          <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500, fontSize: '0.76rem', lineHeight: 1.35 }} noWrap>
                            {item.username}
                          </Typography>
                        )}
                      </Box>
                      <ChevronRightIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.3)', flexShrink: 0 }} />
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Duplicate Items */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: '28px', 
              bgcolor: '#161412',
              border: '1px solid #34322F',
              backgroundImage: 'none',
              height: '100%',
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Typography component="span" variant="h6" sx={{ display: 'block', fontWeight: 900, fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.25 }}>
                  Duplicates
                </Typography>
                <Box sx={{ 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: '10px', 
                  bgcolor: alpha('#6366F1', 0.1),
                  color: '#6366F1',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {dupGroups.length} GROUPS
                </Box>
              </Stack>

              <Stack spacing={2}>
                {loading ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress size={32} sx={{ color: '#6366F1' }} />
                  </Box>
                ) : dupGroups.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ShieldIcon sx={{ fontSize: 40, color: "rgba(255, 255, 255, 0.1)", mb: '12px' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                      No duplicates detected.
                    </Typography>
                  </Box>
                ) : (
                  dupGroups.map((g, idx) => (
                    <Paper key={g.key} sx={{ 
                      p: 2.5, 
                      borderRadius: '20px', 
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Group #{idx + 1}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 700 }}>
                          {g.count} matches
                        </Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', mb: 2 }}>
                        Matching: {g.fields.join(", ")}
                      </Typography>
                      <Button 
                        component={Link}
                        href={`/dashboard?focus=${g.ids[0]}`}
                        fullWidth 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          borderRadius: '12px', 
                          fontWeight: 700,
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#fff'
                        }}
                      >
                        Review Group
                      </Button>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
