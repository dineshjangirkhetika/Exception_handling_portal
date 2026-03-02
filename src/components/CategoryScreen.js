import React, { useState, useEffect, useCallback } from "react";
import { fetchRecords, updateRecordStatus, insertRecord, getCachedRecords } from "../supabaseClient";
import StatusBadge from "./StatusBadge";
import Toast from "./Toast";

const CATEGORY_CONFIG = {
  QC_FAILURE: {
    label: "QC Failures",
    description:
      "Items that failed quality check. See what was dumped, repacked, or treated.",
    statusOptions: ["OPEN", "DUMPED", "REPACKING", "FUMIGATION", "CLOSED"],
    columns: [
      "id",
      "date",
      "item_id",
      "item_name",
      "item_brand",
      "qr_id",
      "batch_id",
      "expiry_date",
      "variety",
      "qty",
      "reason",
      "warehouse",
      "created_by",
      "phone_number",
      "notify_phone",
      "status",
      "status_updated_by",
      "created_at",
      "status_updated_at"
    ]
  },
  STOCK_MISMATCH: {
    label: "Stock Mismatch Alerts",
    description:
      "Stock in warehouse does not match what the system shows. Needs counting and fixing.",
    statusOptions: ["OPEN", "VERIFIED", "RESOLVED"],
    columns: [
      "id",
      "date",
      "item_id",
      "warehouse",
      "created_by",
      "phone_number",
      "notify_phone",
      "created_at",
      "status",
      "scenario",
      "action_required"
    ]
  },
  DISPATCH_LOGS: {
    label: "Dispatch Issues",
    description:
      "Problems found during picking, loading, or sending out orders.",
    statusOptions: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    columns: [
      "id",
      "date",
      "issue_category",
      "order_id",
      "route_id",
      "item_id",
      "description",
      "photo_url",
      "warehouse",
      "created_by",
      "phone_number",
      "created_at",
      "status"
    ]
  },
  ROUTE_ISSUES: {
    label: "Route Problems",
    description:
      "Drivers report problems on the road like breakdowns, traffic, or wrong address.",
    statusOptions: ["OPEN", "SUPPORT_SENT", "RESOLVED"],
    columns: [
      "id",
      "date",
      "route_id",
      "driver_id",
      "issue_type",
      "description",
      "latitude",
      "longitude",
      "photo_url",
      "need_help",
      "created_by",
      "phone_number",
      "created_at",
      "status"
    ]
  },
  OPERATION_ERRORS: {
    label: "Operation Errors",
    description:
      "Machine breakdowns, system errors, and other warehouse problems.",
    statusOptions: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    columns: [
      "id",
      "date",
      "description",
      "warehouse",
      "created_by",
      "phone_number",
      "created_at",
      "status"
    ]
  }
};

// Sample data generators for each category
const SAMPLE_GENERATORS = {
  QC_FAILURE: () => {
    const items = [
      { id: "1004784602", name: "Tomato 1kg", brand: "FreshFarm" },
      { id: "1004784700", name: "Potato 5kg", brand: "AgroBest" },
      { id: "1004784521", name: "Basmati Rice 26kg", brand: "Khetika" },
      { id: "1004784800", name: "Onion 2kg", brand: "LocalFresh" },
      { id: "1004784523", name: "Sugar 50kg", brand: "Khetika" }
    ];
    const reasons = ["Damaged packaging", "Short expiry", "Weight mismatch", "QUALITY_ISSUE", "EXPIRED"];
    const warehouses = ["DHANSAR", "TALOJA", "DELHI"];
    const item = items[Math.floor(Math.random() * items.length)];
    const now = new Date();
    return {
      item_id: item.id,
      item_name: item.name,
      item_brand: item.brand,
      qr_id: `QR-${Math.floor(Math.random() * 9000) + 1000}`,
      batch_id: `BATCH-${Math.floor(Math.random() * 100)}`,
      expiry_date: "2026-06-30",
      variety: ["HYBRID", "PREMIUM", "STANDARD", "BAG"][Math.floor(Math.random() * 4)],
      qty: Math.floor(Math.random() * 10) + 1,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
      created_by: `picker_${Math.floor(Math.random() * 10) + 1}`,
      phone_number: `99999${Math.floor(Math.random() * 90000) + 10000}`,
      notify_phone: `99999${Math.floor(Math.random() * 90000) + 10000}`,
      status: "OPEN",
      action_type: "",
      status_updated_by: "",
      date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
    };
  },
  STOCK_MISMATCH: () => {
    const warehouses = ["DHANSAR", "TALOJA", "DELHI"];
    const scenarios = ["SYSTEM_QTY_MORE_THAN_PHYSICAL", "SYSTEM_QTY_LESS_THAN_PHYSICAL", "PHYSICAL_QTY_ZERO"];
    const actions = ["Cycle count required", "Update system inventory", "Block item for sale", "Verification required"];
    const now = new Date();
    return {
      item_id: `10047846${Math.floor(Math.random() * 900) + 100}`,
      warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
      created_by: Math.random() > 0.5 ? "system" : `allocator_${Math.floor(Math.random() * 5) + 1}`,
      phone_number: `99999${Math.floor(Math.random() * 90000) + 10000}`,
      notify_phone: `99999${Math.floor(Math.random() * 90000) + 10000}`,
      status: "OPEN",
      scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
      action_required: actions[Math.floor(Math.random() * actions.length)],
      date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
    };
  },
  DISPATCH_LOGS: () => {
    const categories = ["DAMAGED_IN_TRANSIT", "MISSING_ITEM", "DELAYED_PICKUP"];
    const descriptions = [
      "Crates toppled during loading",
      "Item not found during dispatch",
      "Vehicle arrived late at dock",
      "Bags torn during transit",
      "Short delivery reported"
    ];
    const warehouses = ["DHANSAR", "TALOJA", "DELHI"];
    const now = new Date();
    return {
      issue_category: categories[Math.floor(Math.random() * categories.length)],
      order_id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      route_id: `ROUTE-${String(Math.floor(Math.random() * 10) + 1).padStart(2, "0")}`,
      item_id: `10047847${Math.floor(Math.random() * 100)}`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      photo_url: "",
      warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
      created_by: `ops_${Math.floor(Math.random() * 10) + 1}`,
      phone_number: `99999${Math.floor(Math.random() * 90000) + 10000}`,
      status: "OPEN",
      date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
    };
  },
  ROUTE_ISSUES: () => {
    const issueTypes = ["BREAKDOWN", "TRAFFIC_JAM", "WRONG_ADDRESS"];
    const descriptions = [
      "Vehicle puncture on highway",
      "Heavy congestion near toll plaza",
      "Customer address not reachable",
      "Engine overheating",
      "Road blocked due to accident"
    ];
    const now = new Date();
    return {
      route_id: `ROUTE-${String(Math.floor(Math.random() * 10) + 1).padStart(2, "0")}`,
      driver_id: `DRV-${String(Math.floor(Math.random() * 10) + 1).padStart(3, "0")}`,
      issue_type: issueTypes[Math.floor(Math.random() * issueTypes.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      latitude: 19 + Math.random(),
      longitude: 72 + Math.random(),
      photo_url: "",
      need_help: Math.random() > 0.5,
      created_by: `driver_${Math.floor(Math.random() * 10) + 1}`,
      phone_number: `99999${Math.floor(Math.random() * 90000) + 10000}`,
      status: "OPEN",
      date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
    };
  },
  OPERATION_ERRORS: () => {
    const descriptions = [
      "Picking delay in outbound staging area",
      "Invoice printing system not working",
      "Handheld sync delay causing order visibility issues",
      "Barcode scanner malfunction",
      "Cold storage temperature alert",
      "Conveyor belt jam in packing zone",
      "Label printer offline at dispatch counter"
    ];
    const warehouses = ["DHANSAR", "TALOJA", "DELHI"];
    const now = new Date();
    return {
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
      created_by: ["system", "ops_team", "sre_team"][Math.floor(Math.random() * 3)],
      phone_number: `99999${Math.floor(Math.random() * 90000) + 10000}`,
      status: "OPEN",
      date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
    };
  }
};

function buildNotificationMessage(category, previousStatus, record, newStatus) {
  const creator = record.created_by || "creator";
  return `Status updated to ${newStatus} successfully! Notification sent to ${creator}.`;
}

// Helper: get today in D-M-YYYY (no leading zeros)
function getTodayDMY() {
  const d = new Date();
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

export default function CategoryScreen({ category, onBack }) {
  const [toast, setToast] = useState(null);
  const initialRecords = getCachedRecords(category);
  const [records, setRecords] = useState(initialRecords);
  const [loading, setLoading] = useState(initialRecords.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const config = CATEGORY_CONFIG[category] || {
    label: category.replace("_", " "),
    statusOptions: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    columns: []
  };

  const loadRecords = useCallback(async () => {
    const data = await fetchRecords(category);
    setRecords(data);
    setLoading(false);
    setRefreshing(false);
  }, [category]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  const handleAddEntry = async () => {
    const generator = SAMPLE_GENERATORS[category];
    if (!generator) return;

    setAdding(true);
    const sampleRecord = generator();
    try {
      const result = await insertRecord(category, sampleRecord);
      if (result) {
        setToast("New entry added successfully!");
        setSelectedDate(getTodayDMY());
        loadRecords();
      } else {
        setToast("Failed to add entry. Check console for details.");
      }
    } catch (err) {
      console.error("Add entry error:", err);
      setToast("Network error: " + (err.message || "Please try again."));
    }
    setTimeout(() => setToast(null), 4000);
    setAdding(false);
  };

  const updateStatus = async (id, newStatus) => {
    const existing = records.find(r => r.id === id);
    if (!existing) return;

    // Update status in UI immediately
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );

    const message = buildNotificationMessage(
      category,
      existing.status,
      existing,
      newStatus
    );
    setToast(message);
    setTimeout(() => setToast(null), 3500);

    // Sync with database in background
    await updateRecordStatus(category, id, newStatus);
  };

  const filteredRecords = records.filter(r => {
    if (!selectedDate) return true;
    // Use the date column (D-M-YYYY) from DB for filtering
    if (r.date) return r.date === selectedDate;
    // Fallback: derive date from created_at if date column missing
    if (r.created_at) {
      const d = new Date(r.created_at);
      const derived = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
      return derived === selectedDate;
    }
    return false;
  });

  const visibleColumns =
    config.columns?.length > 0
      ? config.columns
      : Object.keys(filteredRecords[0] || {});

  return (
    <div className="category-screen">
      <div className="category-header-row">
        <button className="back-button" onClick={onBack}>
          ⬅ Back to Dashboard
        </button>
        <div>
          <h2 className="category-title">{config.label}</h2>
          {config.description && (
            <p className="category-subtitle">{config.description}</p>
          )}
        </div>
      </div>

      <div className="category-toolbar">
        <button className="toolbar-button" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "⟳ Syncing..." : "⟳ Refresh"}
        </button>
        <button
          className="toolbar-button primary"
          onClick={handleAddEntry}
          disabled={adding}
        >
          {adding ? "+ Adding..." : "+ Add Sample Entry"}
        </button>
      </div>

      <div className="filter-bar">
        <span>
          Total Records: <strong>{records.length}</strong>
          {selectedDate && (
            <> | Showing: <strong>{filteredRecords.length}</strong></>
          )}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label>
            Date (D-M-YYYY):
            <input
              type="text"
              placeholder="D-M-YYYY"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ width: "120px", marginLeft: "6px", padding: "4px 8px" }}
            />
          </label>
          <button
            className="toolbar-button"
            onClick={() => setSelectedDate(getTodayDMY())}
            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
          >
            Today
          </button>
          {selectedDate && (
            <button
              className="toolbar-button"
              onClick={() => setSelectedDate("")}
              style={{ padding: "4px 10px", fontSize: "0.85rem" }}
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
          Loading data from database...
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {visibleColumns.map(key => (
                  <th key={key}>{key.replace(/_/g, " ")}</th>
                ))}
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length + 1} style={{ textAlign: "center", color: "#94a3b8" }}>
                    No records found for selected date
                  </td>
                </tr>
              )}

              {filteredRecords.map(record => (
                <tr key={record.id}>
                  {visibleColumns.map(col => {
                    const value = record[col];

                    if (col === "status") {
                      return (
                        <td key={col}>
                          <StatusBadge status={value} />
                        </td>
                      );
                    }

                    return (
                      <td key={col}>
                        {value !== undefined && value !== null
                          ? value.toString()
                          : ""}
                      </td>
                    );
                  })}

                  <td>
                    <select
                      value={record.status}
                      onChange={e => updateStatus(record.id, e.target.value)}
                    >
                      {config.statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
