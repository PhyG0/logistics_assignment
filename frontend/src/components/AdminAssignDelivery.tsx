import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";
import type { ILocation } from "./searchLocation";
import { SearchLocation } from "./searchLocation";

interface Driver {
  _id: string;
  username: string;
  email: string;
  currentDelivery: string | null;
}

interface Vehicle {
  _id: string;
  number: string;
  currentDelivery: string | null;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

interface PendingDelivery {
  _id: string;
  receiver: User;
  endLocation: ILocation;
  message?: string;
  status: string;
  createdAt: string;
}

const AdminAssignDelivery = () => {
  const { sendRequest, loading, error } = useApi();
  const { emit } = useSocket();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<PendingDelivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    vehicleNumber: string;
    driverEmail: string;
    startLocation: ILocation | null;
    currentLocation: ILocation | null;
  }>({
    vehicleNumber: "",
    driverEmail: "",
    startLocation: null,
    currentLocation: null
  });


  useEffect(() => {
    fetchPendingDeliveries();
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchPendingDeliveries = async () => {
    const result = await sendRequest("/api/delivery/pending", "GET");
    if (result) setPendingDeliveries(result);
  };

  const fetchVehicles = async () => {
    const result = await sendRequest("/api/vehicle", "GET");
    if (result) setVehicles(result);
  };

  const fetchDrivers = async () => {
    const result = await sendRequest("/api/delivery/drivers", "GET");
    if (result) setDrivers(result);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  const handleSelectDelivery = (deliveryId: string) => {
    setSelectedDelivery(deliveryId);
    setFormData({
      vehicleNumber: "",
      driverEmail: "",
      startLocation: null,
      currentLocation: null
    });
  };

  const handleAssign = async () => {
    if (!selectedDelivery) {
      toast.error("Please select a delivery");
      return;
    }

    const result = await sendRequest(
      `/api/delivery/${selectedDelivery}/assign`,
      "PUT",
      formData
    );

    if (result) {
      toast.success("Delivery assigned successfully!");
      setSelectedDelivery(null);
      setFormData({
        vehicleNumber: "",
        driverEmail: "",
        startLocation: null,
        currentLocation: null
      });
      fetchPendingDeliveries();
      fetchVehicles();
      fetchDrivers();
      emit("message", {
        from: "admin",
        to: "driver",
        type: "new-delivery",
        data: result
      });
    }
  };

  const selectedDeliveryData = pendingDeliveries.find(
    (d) => d._id === selectedDelivery
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Assign Deliveries</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Deliveries List */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-xl font-semibold mb-3">Pending Requests</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pendingDeliveries.length === 0 && (
              <p className="text-gray-500">No pending deliveries</p>
            )}
            {pendingDeliveries.map((delivery) => (
              <div
                key={delivery._id}
                onClick={() => handleSelectDelivery(delivery._id)}
                className={`p-3 border rounded cursor-pointer hover:bg-blue-50 transition ${
                  selectedDelivery === delivery._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <div className="font-medium">
                  {delivery.receiver.username}
                </div>
                <div className="text-sm text-gray-600">
                  To: {delivery.endLocation.formatted}
                </div>
                {delivery.message && (
                  <div className="text-sm text-gray-500 mt-1">
                    Note: {delivery.message}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(delivery.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Form */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-xl font-semibold mb-3">Assign Resources</h3>

          {!selectedDelivery ? (
            <p className="text-gray-500">Select a delivery to assign</p>
          ) : (
            <div className="grid gap-4">
              {/* Selected Delivery Info */}
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-medium">
                  Receiver: {selectedDeliveryData?.receiver.username}
                </div>
                <div className="text-sm">
                  Destination: {selectedDeliveryData?.endLocation.formatted}
                </div>
                {selectedDeliveryData?.message && (
                  <div className="text-sm mt-1">
                    Message: {selectedDeliveryData.message}
                  </div>
                )}
              </div>

              {/* Vehicle */}
              <div>
                <label className="block font-medium mb-1">Vehicle *</label>
                <select
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option
                      key={v._id}
                      value={v.number}
                      disabled={!!v.currentDelivery}
                    >
                      {v.number} {v.currentDelivery ? "(In Use)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver */}
              <div>
                <label className="block font-medium mb-1">Driver *</label>
                <select
                  name="driverEmail"
                  value={formData.driverEmail}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option
                      key={d._id}
                      value={d.email}
                      disabled={!!d.currentDelivery}
                    >
                      {d.username} {d.currentDelivery ? "(Busy)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              {/* Start Location */}
              <div>
                <label className="block font-medium mb-1">Pickup Location *</label>
                <SearchLocation
                  onSelectLocation={(loc: ILocation) =>
                    setFormData((prev) => ({ ...prev, startLocation: loc }))
                  }
                />
              </div>

              {/* Current Location */}
              <div>
                <label className="block font-medium mb-1">
                  Current Location (optional)
                </label>
                <SearchLocation
                  onSelectLocation={(loc: ILocation) =>
                    setFormData((prev) => ({ ...prev, currentLocation: loc }))
                  }
                />
              </div>

              <button
                onClick={handleAssign}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Assigning..." : "Assign Delivery"}
              </button>

              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignDelivery;