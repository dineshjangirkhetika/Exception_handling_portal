import React from "react";

export default function StatusBadge({ status }) {
  const colorMap = {
    OPEN: "red",
    IN_PROGRESS: "orange",
    RESOLVED: "green",
    CLOSED: "gray",
    DUMPED: "orange",
    REPACKING: "blue",
    FUMIGATION: "purple"
  };

  return (
    <span className={`badge ${colorMap[status]}`}>
      {status}
    </span>
  );
}