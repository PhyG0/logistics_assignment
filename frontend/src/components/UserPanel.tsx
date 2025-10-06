import { useEffect, useState } from "react";
import Deliveries from "./Deliveries";
import UserCreateDelivery from "./UserCreateDelivery";
import type { IDelivery } from "./Deliveries";
import Map from "./Map";

const UserPanel = () => {
  const [activeTab, setActiveTab] = useState<"deliveries" | "create-request">("deliveries");
  const [currentDelivery, setCurrentDelivery] = useState<IDelivery | null>(null);

  return (
    <div className="flex flex-col h-screen">
      {/* Header with Tabs */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("deliveries")}
                className={`px-4 py-2 rounded ${
                  activeTab === "deliveries"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                My Deliveries
              </button>
              <button
                onClick={() => setActiveTab("create-request")}
                className={`px-4 py-2 rounded ${
                  activeTab === "create-request"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Request Delivery
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === "deliveries" && <Deliveries setCurrentDelivery={setCurrentDelivery} />}
          {activeTab === "create-request" && <UserCreateDelivery />}
          {currentDelivery && (
            <div className="mt-6 h-96 rounded shadow overflow-hidden">
              <Map A={currentDelivery.currentLocation ?? currentDelivery.startLocation} B={currentDelivery.endLocation} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserPanel;