import { Routes, Route, NavLink } from "react-router-dom";
import { Radio, LayoutGrid, Settings2 } from "lucide-react";
import PublicDashboard from "./pages/PublicDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <Radio size={18} strokeWidth={2.5} />
          <span>Beacon</span>
        </div>
        <nav className="topnav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <LayoutGrid size={15} /> Links
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            <Settings2 size={15} /> Admin
          </NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
