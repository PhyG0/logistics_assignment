import { useState } from "react";
import Deliveries from "./Deliveries";
import UserCreateDelivery from "./UserCreateDelivery";
import type { IDelivery } from "./Deliveries";
import Map from "./Map";

const UserPanel = () => {
  const [activeTab, setActiveTab] = useState<"deliveries" | "create-request">("deliveries");
  const [currentDelivery, setCurrentDelivery] = useState<IDelivery | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false); // To control the map modal visibility

  // Handle opening and closing of the map modal
  const toggleMapModal = () => setIsMapModalOpen((prev) => !prev);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Deliveries
            </h1>

            {/* Tabs */}
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab("deliveries")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === "deliveries"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                My Deliveries
              </button>
              <button
                onClick={() => setActiveTab("create-request")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === "create-request"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Request Delivery
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className={`grid gap-6 ${currentDelivery ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Tab Content */}
            <div className="w-full">
              {activeTab === "deliveries" && (
                <Deliveries setCurrentDelivery={setCurrentDelivery} />
              )}
              {activeTab === "create-request" && <UserCreateDelivery />}
            </div>

            {/* Button to open Map Modal */}
            {currentDelivery && (
              <div className="flex justify-end">
                <button
                  onClick={toggleMapModal}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
                >
                  View Map
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Map Modal */}
      {isMapModalOpen && currentDelivery && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
          onClick={toggleMapModal} // Close modal on clicking outside
        >
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full h-[80vh] sm:h-[90vh]"
            onClick={(e) => e.stopPropagation()} // Prevent closing on modal content click
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Delivery Route</h2>
              <button
                onClick={toggleMapModal}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="h-full">
              <Map
                A={currentDelivery.currentLocation ?? currentDelivery.startLocation}
                B={currentDelivery.endLocation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
