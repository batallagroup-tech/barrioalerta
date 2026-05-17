import React from "react";
import { DashboardView } from "./views/DashboardView";
import PWAWelcome from "./components/onboarding/PWAWelcome";

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PWAWelcome />
      <DashboardView />
    </div>
  );
}

export default App;
