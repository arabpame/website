import "server-only";
import { supabaseConfigured, supabaseStore } from "@/lib/reports/db";
import { localStore } from "@/lib/reports/local";
import type { ReportStore } from "@/lib/reports/types";

/**
 * Which store the site uses, decided once per process.
 *
 *   Supabase configured            -> Supabase. Always, everywhere.
 *   Not configured, on a laptop    -> the local file store, so the flow can be
 *                                     developed and demonstrated offline.
 *   Not configured, on Vercel      -> nothing. Filing a report returns a clear
 *                                     "not available" error and reading returns
 *                                     no reports. A serverless file system is
 *                                     discarded after every request, so a local
 *                                     store there would lose every report.
 *
 * VERCEL is set automatically on every Vercel build and function.
 */
export function getReportStore(): ReportStore | null {
  if (supabaseConfigured()) return supabaseStore;
  if (process.env.VERCEL) return null;
  return localStore;
}

/** True when a report filed right now would actually be kept. */
export function reportingAvailable(): boolean {
  return getReportStore() !== null;
}
