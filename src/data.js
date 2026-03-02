// Sample data for the dashboard.
// Has all 5 types of records:
// - qcFailures      = items that failed quality check
// - stockMismatch   = stock count does not match system
// - dispatchLogs    = problems during packing and sending
// - routeIssues     = driver problems on the road
// - operationErrors = machine and system problems
//
// You can use it like this:
//   import { qcFailures } from "./data";
//   import data from "./data";

// Helper to make dates for the last 7 days.
const today = "2026-02-26";
const ts = (dayOffset, time = "10:00:00") => {
  const base = new Date(`${today}T${time}Z`);
  base.setDate(base.getDate() + dayOffset);
  return base.toISOString();
};

export const qcFailures = [
  {
    id: 1,
    item_id: "1004784602",
    item_name: "Tomato 1kg",
    item_brand: "FreshFarm",
    qr_id: "QR-1001",
    batch_id: "BATCH-001",
    expiry_date: "2026-03-15",
    variety: "HYBRID",
    qty: 5,
    reason: "Damaged packaging",
    warehouse: "DHANSAR",
    created_by: "picker_01",
    phone_number: "9999990001",
    notify_phone: "9999991001",
    status: "OPEN",
    action_type: "",
    status_updated_by: "",
    created_at: ts(0, "09:10:00"),
    status_updated_at: ""
  },
  {
    id: 2,
    item_id: "1004784602",
    item_name: "Tomato 1kg",
    item_brand: "FreshFarm",
    qr_id: "QR-1002",
    batch_id: "BATCH-001",
    expiry_date: "2026-03-15",
    variety: "HYBRID",
    qty: 3,
    reason: "Short expiry",
    warehouse: "DHANSAR",
    created_by: "picker_02",
    phone_number: "9999990002",
    notify_phone: "9999991001",
    status: "ACTION_TAKEN",
    action_type: "REPACKING",
    status_updated_by: "allocator_01",
    created_at: ts(-2, "14:20:00"),
    status_updated_at: ts(-1, "11:05:00")
  },
  {
    id: 3,
    item_id: "1004784700",
    item_name: "Potato 5kg",
    item_brand: "AgroBest",
    qr_id: "QR-1003",
    batch_id: "BATCH-010",
    expiry_date: "2026-04-10",
    variety: "PREMIUM",
    qty: 2,
    reason: "Weight mismatch",
    warehouse: "TALOJA",
    created_by: "picker_03",
    phone_number: "9999990003",
    notify_phone: "9999991002",
    status: "OPEN",
    action_type: "",
    status_updated_by: "",
    created_at: ts(-5, "16:45:00"),
    status_updated_at: ""
  }
];

export const stockMismatch = [
  {
    id: 1,
    item_id: "1004784601",
    warehouse: "TALOJA",
    created_by: "system",
    phone_number: "9999992001",
    notify_phone: "9999993001",
    created_at: ts(0, "08:00:00"),
    status: "OPEN",
    scenario: "SYSTEM_QTY_MORE_THAN_PHYSICAL",
    action_required: "Cycle count required"
  },
  {
    id: 2,
    item_id: "1004784601",
    warehouse: "TALOJA",
    created_by: "allocator_02",
    phone_number: "9999992002",
    notify_phone: "9999993001",
    created_at: ts(-3, "12:30:00"),
    status: "VERIFIED",
    scenario: "SYSTEM_QTY_LESS_THAN_PHYSICAL",
    action_required: "Update system inventory"
  },
  {
    id: 3,
    item_id: "1004784800",
    warehouse: "DHANSAR",
    created_by: "allocator_03",
    phone_number: "9999992003",
    notify_phone: "9999993002",
    created_at: ts(-8, "15:10:00"),
    status: "RESOLVED",
    scenario: "PHYSICAL_QTY_ZERO",
    action_required: "Block item for sale"
  }
];

export const dispatchLogs = [
  {
    id: 1,
    issue_category: "DAMAGED_IN_TRANSIT",
    order_id: "ORD-10001",
    route_id: "ROUTE-01",
    item_id: "1004784602",
    description: "Crates toppled during loading",
    photo_url: "",
    warehouse: "DHANSAR",
    created_by: "ops_01",
    phone_number: "9999994001",
    created_at: ts(0, "07:30:00"),
    status: "OPEN"
  },
  {
    id: 2,
    issue_category: "MISSING_ITEM",
    order_id: "ORD-10002",
    route_id: "ROUTE-02",
    item_id: "1004784700",
    description: "Item not found during dispatch",
    photo_url: "",
    warehouse: "DHANSAR",
    created_by: "ops_02",
    phone_number: "9999994002",
    created_at: ts(-1, "18:15:00"),
    status: "IN_PROGRESS"
  },
  {
    id: 3,
    issue_category: "DELAYED_PICKUP",
    order_id: "ORD-10003",
    route_id: "ROUTE-03",
    item_id: "1004784800",
    description: "Vehicle arrived late at dock",
    photo_url: "",
    warehouse: "TALOJA",
    created_by: "ops_03",
    phone_number: "9999994003",
    created_at: ts(-6, "10:50:00"),
    status: "RESOLVED"
  }
];

export const routeIssues = [
  {
    id: 1,
    route_id: "ROUTE-01",
    driver_id: "DRV-001",
    issue_type: "BREAKDOWN",
    description: "Vehicle puncture on highway",
    latitude: 19.1234,
    longitude: 72.9876,
    photo_url: "",
    need_help: true,
    created_by: "driver_01",
    phone_number: "9999995001",
    created_at: ts(0, "11:20:00"),
    status: "OPEN"
  },
  {
    id: 2,
    route_id: "ROUTE-02",
    driver_id: "DRV-002",
    issue_type: "TRAFFIC_JAM",
    description: "Heavy congestion near toll plaza",
    latitude: 19.5678,
    longitude: 73.1234,
    photo_url: "",
    need_help: false,
    created_by: "driver_02",
    phone_number: "9999995002",
    created_at: ts(-2, "13:05:00"),
    status: "SUPPORT_SENT"
  },
  {
    id: 3,
    route_id: "ROUTE-03",
    driver_id: "DRV-003",
    issue_type: "WRONG_ADDRESS",
    description: "Customer address not reachable",
    latitude: 19.9012,
    longitude: 72.7654,
    photo_url: "",
    need_help: false,
    created_by: "driver_03",
    phone_number: "9999995003",
    created_at: ts(-9, "17:40:00"),
    status: "RESOLVED"
  }
];

// Machine and system problems in the warehouse.
export const operationErrors = [
  {
    id: 1,
    description: "Picking delay in outbound staging area",
    warehouse: "DHANSAR",
    created_by: "system",
    phone_number: "9999996001",
    created_at: ts(0, "06:45:00"),
    status: "OPEN"
  },
  {
    id: 2,
    description: "Invoice printing system not working at packing station",
    warehouse: "TALOJA",
    created_by: "system",
    phone_number: "9999996002",
    created_at: ts(-1, "02:10:00"),
    status: "IN_PROGRESS"
  },
  {
    id: 3,
    description: "Handheld sync delay causing order visibility issues",
    warehouse: "DHANSAR",
    created_by: "sre_team",
    phone_number: "9999996003",
    created_at: ts(-4, "19:30:00"),
    status: "RESOLVED"
  }
];

// Same data with a different name for the old Dashboard view.
export const dispatchIssues = dispatchLogs;

// All data together so you can import everything at once.
const data = {
  qcFailures,
  stockMismatch,
  dispatchLogs,
  routeIssues,
  operationErrors
};

export default data;
