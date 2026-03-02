import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://twaohpngrwurqxlswfjv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YW9ocG5ncnd1cnF4bHN3Zmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjEyMDIsImV4cCI6MjA4Nzk5NzIwMn0.7J4FuxZVbC9Yc01J5tGZhCqComnOQVEOzYhdOklxw_A";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Map category keys to Supabase table names
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

export async function fetchRecords(category) {
  const table = getTableName(category);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
  return data || [];
}

export async function updateRecordStatus(category, id, status) {
  const table = getTableName(category);
  const { error } = await supabase
    .from(table)
    .update({ status, status_updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(`Error updating ${table}:`, error);
    return false;
  }
  return true;
}

export async function insertRecord(category, record) {
  const table = getTableName(category);
  const { data, error } = await supabase
    .from(table)
    .insert([record])
    .select();

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    return null;
  }
  return data?.[0] || null;
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
