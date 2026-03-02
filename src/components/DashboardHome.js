import React from "react";

export default function DashboardHome({ onSelect }) {
  const categories = [
    {
      key: "QC_FAILURE",
      title: "QC Failures",
      description: "Quality control failures and defects",
      iconLabel: "QC",
      clickable: true,
      cardClass: "card--pink"
    },
    {
      key: "STOCK_MISMATCH",
      title: "Stock Mismatch",
      description: "Inventory discrepancies",
      iconLabel: "ST",
      clickable: true,
      cardClass: "card--beige"
    },
    {
      key: "DISPATCH_LOGS",
      title: "Dispatch Errors",
      description: "Shipping and dispatch issues",
      iconLabel: "DS",
      clickable: true,
      cardClass: "card--lime"
    },
    {
      key: "ROUTE_ISSUES",
      title: "Route Issues",
      description: "Delivery route problems",
      iconLabel: "RT",
      clickable: true,
      cardClass: "card--slate"
    },
    {
      key: "OPERATION_ERRORS",
      title: "Operation Errors",
      description: "Operational and system issues",
      iconLabel: "OP",
      clickable: true,
      cardClass: "card--gray"
    },
    {
      key: "DAILY_TOP_10",
      title: "Daily Top 10",
      description: "Top issues summary",
      iconLabel: "10",
      clickable: true,
      cardClass: "card--green"
    }
  ];

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Exception Management System</h1>
          <p className="dashboard-subtitle">
            All records are captured from SuperDisha and SuperOps apps. Monitor and manage operational exceptions in real-time.
          </p>
        </div>
       
      </header>

      <section className="dashboard-section">
        <h2 className="section-title">Exception Categories</h2>

        <div className="card-grid">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`category-card ${cat.cardClass} ${
                cat.clickable ? "is-clickable" : "is-disabled"
              }`}
              type="button"
              onClick={() => cat.clickable && onSelect(cat.key)}
            >
              <div className="card-icon" aria-hidden="true">
                <span className={`card-icon-symbol card-icon-${cat.key.toLowerCase()}`}>
                  {cat.iconLabel}
                </span>
              </div>
              <div className="card-content">
                <div className="card-title-row">
                  <h3 className="card-title">{cat.title}</h3>
                  <span className="card-chevron">›</span>
                </div>
                <p className="card-description">
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}