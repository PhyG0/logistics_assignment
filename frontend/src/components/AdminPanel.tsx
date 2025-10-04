import { useState } from "react";
import Vehicles from "./Vehicles";
import Deliveries from "./Deliveries";
import Drivers from "./Drivers";
import AdminAssignDelivery from "./AdminAssignDelivery";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<"vehicles" | "deliveries" | "drivers" | "assign-delivery">("vehicles");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-white shadow flex-col">
        <div className="p-6 font-bold text-xl border-b border-blue-500">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["vehicles", "drivers", "deliveries", "assign-delivery"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`w-full text-left p-2 rounded hover:bg-blue-500 ${
                activeTab === tab ? "bg-blue-700 text-white" : ""
              }`}
            >
              {tab === "assign-delivery"
                ? "Assign Delivery"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow p-4 flex justify-between items-center">
        <span className="font-bold text-lg">Admin Panel</span>
        <button
          className="p-2 border rounded"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-white shadow p-4 space-y-2">
          {["vehicles", "drivers", "deliveries", "assign-delivery"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any);
                setMenuOpen(false);
              }}
              className={`w-full text-left p-2 rounded hover:bg-blue-500 ${
                activeTab === tab ? "bg-blue-700 text-white" : ""
              }`}
            >
              {tab === "assign-delivery"
                ? "Assign Delivery"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {activeTab === "vehicles" && <Vehicles />}
        {activeTab === "deliveries" && <Deliveries />}
        {activeTab === "drivers" && <Drivers />}
        {activeTab === "assign-delivery" && <AdminAssignDelivery />}
      </main>
    </div>
  );
};

export default AdminPanel;