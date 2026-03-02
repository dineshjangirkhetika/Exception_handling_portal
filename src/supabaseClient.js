import { createClient } from "@supabase/supabase-js";
import SEED_DATA from "./seedData";

const SUPABASE_URL = "https://twaohpngrwurqxlswfjv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YW9ocG5ncnd1cnF4bHN3Zmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjEyMDIsImV4cCI6MjA4Nzk5NzIwMn0.7J4FuxZVbC9Yc01J5tGZhCqComnOQVEOzYhdOklxw_A";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLE_MAP = {
  QC_FAILURE: "qc_failures",
  STOCK_MISMATCH: "stock_mismatch",
  DISPATCH_LOGS: "dispatch_support_logs",
  ROUTE_ISSUES: "route_issues",
  OPERATION_ERRORS: "operation_errors"
};

export function getTableName(category) {
  return TABLE_MAP[category] || category;
}

// --- Get sample data when database is down ---
function getSeedData(category) {
  return SEED_DATA[category] || [];
}

// --- Save data on phone/browser for faster loading ---
const CACHE_VERSION = "v3";

function getCacheKey(category) {
  return `ems_${CACHE_VERSION}_${category}`;
}

// Remove old saved data when app starts
(function clearOldCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith("ems_") && !k.startsWith(`ems_${CACHE_VERSION}_`)) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
})();

function getCache(category) {
  try {
    const raw = localStorage.getItem(getCacheKey(category));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < 10 * 60 * 1000) return data;
  } catch {}
  return null;
}

function setCache(category, data) {
  try {
    localStorage.setItem(
      getCacheKey(category),
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {}
}

// --- Stop waiting if database takes too long ---
function withTimeout(promise, ms = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    )
  ]);
}

// --- Functions used by the app ---

export function getCachedRecords(category) {
  return getCache(category) || getSeedData(category);
}

export async function fetchRecords(category) {
  const table = getTableName(category);
  try {
    const { data, error } = await withTimeout(
      supabase.from(table).select("*").order("created_at", { ascending: false })
    );
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return getCache(category) || getSeedData(category);
    }
    const records = data || [];
    if (records.length > 0) {
      setCache(category, records);
      return records;
    }
    return getSeedData(category);
  } catch (err) {
    console.error(`Fetch timeout/error for ${table}:`, err);
    return getCache(category) || getSeedData(category);
  }
}

export async function updateRecordStatus(category, id, status) {
  const table = getTableName(category);
  try {
    const { error } = await withTimeout(
      supabase
        .from(table)
        .update({ status, status_updated_at: new Date().toISOString() })
        .eq("id", id)
    );
    if (error) {
      console.error(`Error updating ${table}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Update timeout for ${table}:`, err);
    return false;
  }
}

export async function insertRecord(category, record) {
  const table = getTableName(category);
  try {
    const { data, error } = await withTimeout(
      supabase.from(table).insert([record]).select(),
      15000
    );
    if (error) {
      console.error(`Error inserting into ${table}:`, error.message, error.details, error.hint);
      return null;
    }
    return data?.[0] || null;
  } catch (err) {
    console.error(`Insert timeout/error for ${table}:`, err);
    return null;
  }
}

export async function fetchAllForTopIssues() {
  const categories = Object.keys(TABLE_MAP);
  const results = {};

  await Promise.all(
    categories.map(async (cat) => {
      results[cat] = await fetchRecords(cat);
    })
  );

  return results;
}

export function getCachedAllForTopIssues() {
  const categories = Object.keys(TABLE_MAP);
  const results = {};
  let hasAny = false;
  categories.forEach((cat) => {
    const cached = getCache(cat);
    if (cached && cached.length > 0) {
      results[cat] = cached;
      hasAny = true;
    } else {
      results[cat] = getSeedData(cat);
      if (results[cat].length > 0) hasAny = true;
    }
  });
  return hasAny ? results : null;
}
