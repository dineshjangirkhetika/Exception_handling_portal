import React from "react";

export default function DashboardHome({ onSelect }) {
  const categories = [
    {
      key: "QC_FAILURE",
      title: "QC Failures",
      description: "Items that failed quality check",
      iconLabel: "QC",
      clickable: true,
      cardClass: "card--pink"
    },
    {
      key: "STOCK_MISMATCH",
      title: "Stock Mismatch",
      description: "Stock count does not match system",
      iconLabel: "ST",
      clickable: true,
      cardClass: "card--beige"
    },
    {
      key: "DISPATCH_LOGS",
      title: "Dispatch Issues",
      description: "Problems during packing and sending orders",
      iconLabel: "DS",
      clickable: true,
      cardClass: "card--lime"
    },
    {
      key: "ROUTE_ISSUES",
      title: "Route Problems",
      description: "Delays and issues on delivery routes",
      iconLabel: "RT",
      clickable: true,
      cardClass: "card--slate"
    },
    {
      key: "OPERATION_ERRORS",
      title: "Operation Errors",
      description: "Machine and system problems in warehouse",
      iconLabel: "OP",
      clickable: true,
      cardClass: "card--gray"
    },
    {
      key: "DAILY_TOP_10",
      title: "Daily Top 10",
      description: "Today's biggest problems to fix first",
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
            All records come from SuperDisha and SuperOps apps. Track and fix warehouse problems here.
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