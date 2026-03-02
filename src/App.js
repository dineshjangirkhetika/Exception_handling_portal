import React, { useState, useEffect, useCallback } from "react";
import DashboardHome from "./components/DashboardHome";
import CategoryScreen from "./components/CategoryScreen";
import TopIssuesScreen from "./components/TopIssuesScreen";
import "./styles.css";

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelect = useCallback((category) => {
    setSelectedCategory(category);
    window.history.pushState({ category }, "", `#${category}`);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCategory(null);
    window.history.pushState({ category: null }, "", window.location.pathname);
  }, []);

  useEffect(() => {
    const onPopState = (e) => {
      setSelectedCategory(e.state?.category || null);
    };
    window.addEventListener("popstate", onPopState);

    // Handle direct hash URL on load
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setSelectedCategory(hash);
      window.history.replaceState({ category: hash }, "");
    } else {
      window.history.replaceState({ category: null }, "");
    }

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  let content = (
    <DashboardHome onSelect={handleSelect} />
  );

  if (selectedCategory === "DAILY_TOP_10") {
    content = <TopIssuesScreen onBack={handleBack} />;
  } else if (selectedCategory) {
    content = (
      <CategoryScreen
        category={selectedCategory}
        onBack={handleBack}
      />
    );
  }

  return <div className="app">{content}</div>;
}

export default App;