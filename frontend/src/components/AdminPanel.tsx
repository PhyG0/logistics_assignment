import { useState } from "react";
import Vehicles from "./Vehicles";
import Deliveries from "./Deliveries";
import Drivers from "./Drivers";
import CreateDelivery from "./CreateDelivery";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<"vehicles" | "deliveries" | "drivers" | "create-delivery">("vehicles");

  return (
    <div className="flex">
      <aside className="w-64 bg-white shadow flex flex-col">
        <div className="p-6 font-bold text-xl border-b border-blue-500">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("vehicles")}
            className={`w-full text-left p-2 rounded hover:bg-blue-500 ${
              activeTab === "vehicles" ? "bg-blue-700 text-white" : ""
            }`}
          >
            Vehicles
          </button>
         <button
            onClick={() => setActiveTab("drivers")}
            className={`w-full text-left p-2 rounded hover:bg-blue-500 ${
              activeTab === "drivers" ? "bg-blue-700 text-white" : ""
            }`}
          >
            Drivers
          </button>
          <button
            onClick={() => setActiveTab("deliveries")}
            className={`w-full text-left p-2 rounded hover:bg-blue-500 ${
              activeTab === "deliveries" ? "bg-blue-700 text-white" : ""
            }`}
          >
            Deliveries
          </button>
                    <button
            onClick={() => setActiveTab("create-delivery")}
            className={`w-full text-left p-2 rounded hover:bg-blue-500 ${
              activeTab === "create-delivery" ? "bg-blue-700 text-white" : ""
            }`}
          >
            Create Delivery
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-100">
        {activeTab === "vehicles" && <Vehicles />}
        {activeTab === "deliveries" && <Deliveries />}
        {activeTab === "drivers" && <Drivers />}
        {activeTab === "create-delivery" && <CreateDelivery />}
      </main>
    </div>
  );
};

export default AdminPanel;
