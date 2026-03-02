import React, { useMemo, useState, useEffect } from "react";
import { fetchAllForTopIssues, getCachedAllForTopIssues } from "../supabaseClient";

export default function TopIssuesScreen({ onBack }) {
  const cachedData = getCachedAllForTopIssues();
  const [allData, setAllData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [refreshing, setRefreshing] = useState(false);
  const [focusTop3, setFocusTop3] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!allData) setLoading(true);
    const results = await fetchAllForTopIssues();
    setAllData(results);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { rows, today } = useMemo(() => {
    if (!allData) return { rows: [], today: new Date().toISOString().slice(0, 10) };

    const qcFailures = allData.QC_FAILURE || [];
    const stockMismatch = allData.STOCK_MISMATCH || [];
    const dispatchLogs = allData.DISPATCH_LOGS || [];
    const routeIssues = allData.ROUTE_ISSUES || [];
    const operationErrors = allData.OPERATION_ERRORS || [];

    // Derive "today" from the latest created_at
    const allCreatedAt = [
      ...qcFailures,
      ...stockMismatch,
      ...dispatchLogs,
      ...routeIssues,
      ...operationErrors
    ].map(r => new Date(r.created_at));

    const latestDate =
      allCreatedAt.length > 0
        ? new Date(Math.max(...allCreatedAt.map(d => d.getTime())))
        : new Date();

    const TODAY_REF = latestDate.toISOString().slice(0, 10);

    const isToday = dateStr => dateStr && dateStr.startsWith(TODAY_REF);

    const isWithinLast7Days = dateStr => {
      if (!dateStr) return false;
      const current = new Date(TODAY_REF);
      const recordDate = new Date(dateStr);
      const diffTime = current - recordDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    };

    const all = [];

    qcFailures.forEach(r => {
      all.push({
        exception_type: "QC_FAILURE",
        reference_id: r.id,
        warehouse: r.warehouse,
        created_at: r.created_at
      });
    });

    stockMismatch.forEach(r => {
      all.push({
        exception_type: "STOCK_MISMATCH",
        reference_id: r.id,
        warehouse: r.warehouse,
        created_at: r.created_at
      });
    });

    dispatchLogs.forEach(r => {
      all.push({
        exception_type: "DISPATCH_SUPPORT",
        reference_id: r.id,
        warehouse: r.warehouse,
        created_at: r.created_at
      });
    });

    routeIssues.forEach(r => {
      all.push({
        exception_type: "ROUTE_ISSUE",
        reference_id: r.id,
        warehouse: r.warehouse,
        created_at: r.created_at
      });
    });

    operationErrors.forEach(r => {
      all.push({
        exception_type: "OPERATION_ERROR",
        reference_id: r.id,
        warehouse: r.warehouse,
        created_at: r.created_at
      });
    });

    // Grouping
    const grouped = new Map();

    all.forEach(item => {
      const key = `${item.exception_type}::${item.reference_id}::${item.warehouse}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          exception_type: item.exception_type,
          reference_id: item.reference_id,
          warehouse: item.warehouse,
          today_count: 0,
          repeat_count: 0
        });
      }

      const current = grouped.get(key);

      if (isToday(item.created_at)) {
        current.today_count += 1;
      }

      if (isWithinLast7Days(item.created_at)) {
        current.repeat_count += 1;
      }
    });

    // Scoring
    const scored = Array.from(grouped.values()).map(item => ({
      ...item,
      score: item.today_count * 2 + item.repeat_count
    }));

    const sorted = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        ...item
      }));

    return { rows: sorted, today: TODAY_REF };
  }, [allData]);

  const handleRefresh = () => {
    loadData(true);
  };

  const toggleFocusTop3 = () => {
    setFocusTop3(prev => !prev);
  };

  const visibleRows = focusTop3 ? rows.slice(0, 3) : rows;

  return (
    <div className="category-screen">
      <div className="category-header-row">
        <button className="back-button" onClick={onBack}>
          ⬅ Back to Dashboard
        </button>
        <div>
          <h2 className="category-title">Daily Top 10 Issues</h2>
          <p className="category-subtitle">
            Today's top problems from all categories. Fix these first.
          </p>
        </div>
      </div>

      <div className="category-toolbar">
        <div className="category-toolbar-left">
          <span>Insights tools</span>
        </div>
        <div className="category-toolbar-right">
          <button className="toolbar-button" type="button" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "⟳ Syncing..." : "⟳ Refresh"}
          </button>
          <button
            className="toolbar-button primary"
            type="button"
            onClick={toggleFocusTop3}
          >
            ★ {focusTop3 ? "Show Top 10" : "Focus on Top 3"}
          </button>
        </div>
      </div>

      <p className="top10-meta">
        <span className="pill pill-soft">
          Date: <strong>{today}</strong>
        </span>
        <span className="pill pill-soft">
          Total Records: <strong>{rows.length}</strong>
        </span>
        <span className="pill pill-outline">
          Score = (Today's count × 2) + Last 7 days repeat count
        </span>
      </p>

      {loading ? (
        <p style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
          Loading data from database...
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Exception Type</th>
                <th>Reference ID</th>
                <th>Warehouse / Route</th>
                <th>Today</th>
                <th>7 Day Repeat</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.rank}</td>
                  <td>{row.exception_type}</td>
                  <td>{row.reference_id}</td>
                  <td>{row.warehouse}</td>
                  <td>{row.today_count}</td>
                  <td>{row.repeat_count}</td>
                  <td>
                    <strong>{row.score}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
