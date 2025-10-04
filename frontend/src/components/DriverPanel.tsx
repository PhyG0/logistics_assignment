import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket"; 
import useUser from "../hooks/useUser";
import type { IUserContext } from "../context/userContext";
import toast from "react-hot-toast";

interface Delivery {
  _id: string;
  vehicle: string;
  driver: string;
  receiver: string;
  startLocation: string;
  endLocation: string;
  currentLocation: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export interface IMessage {
  from: string;
  to: string;
  type: string;
  data: Delivery;
}

const DriverPanel = () => {
  const { sendRequest, loading, error } = useApi();
  const { user } = useUser() as IUserContext;
  const { emit, on, off } = useSocket();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [updateForm, setUpdateForm] = useState({
    currentLocation: "",
    startTime: "",
    endTime: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();

    const handleMessage = (data: IMessage) => {
      if(data.to !== "driver") return;

      if(data.type === "new-delivery") {
        setDeliveries((prev) => [...prev, data.data]);
        toast.success("New delivery created!");
      }
    };

    on("message", handleMessage);
    return () => off("message", handleMessage);
  }, []);

  const fetchDeliveries = async () => {
    const result = await sendRequest("/api/delivery/driver", "GET");
    if (result) setDeliveries(result);
  };

  const emitMessage = (message: IMessage) => {
    emit("message", message);
  };

  const handleUpdateClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setUpdateForm({
      currentLocation: delivery.currentLocation || "",
      startTime: delivery.startTime || "",
      endTime: delivery.endTime || ""
    });
    setShowModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);

    const updateData: any = {
      deliveryId: selectedDelivery?._id,
    };

    if (updateForm.currentLocation) updateData.currentLocation = updateForm.currentLocation;
    if (updateForm.startTime) updateData.startTime = updateForm.startTime;
    if (updateForm.endTime) updateData.endTime = updateForm.endTime;

    const result = await sendRequest("/api/delivery", "PUT", updateData);

    setUpdateLoading(false);
    
    if (result) {
      setShowModal(false);
      fetchDeliveries();
      emitMessage({from: user?.id, to: "admin", type: "update", data: result})
    }
  };

  const handleStartDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setUpdateForm({
      currentLocation: delivery.currentLocation,
      startTime: new Date().toISOString(),
      endTime: ""
    });
    setShowModal(true);
  };

  const getDeliveryStatus = (delivery: Delivery) => {
    if (delivery.endTime) return { text: "Completed", color: "bg-green-100 text-green-800" };
    if (delivery.startTime) return { text: "In Progress", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Pending", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Deliveries</h2>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">Start Location</th>
              <th className="p-2 border text-left">End Location</th>
              <th className="p-2 border text-left">Current Location</th>
              <th className="p-2 border text-left">Status</th>
              <th className="p-2 border text-left">Start Time</th>
              <th className="p-2 border text-left">End Time</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => {
              const status = getDeliveryStatus(delivery);
              return (
                <tr key={delivery._id}>
                  <td className="p-2 border">{delivery.startLocation}</td>
                  <td className="p-2 border">{delivery.endLocation}</td>
                  <td className="p-2 border">{delivery.currentLocation || "-"}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded text-sm ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {delivery.startTime ? new Date(delivery.startTime).toLocaleString() : "-"}
                  </td>
                  <td className="p-2 border">
                    {delivery.endTime ? new Date(delivery.endTime).toLocaleString() : "-"}
                  </td>
                  <td className="p-2 border text-center">
                    {!delivery.startTime && (
                      <button
                        onClick={() => handleStartDelivery(delivery)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 text-sm hover:bg-blue-600"
                      >
                        Start
                      </button>
                    )}
                    {delivery.startTime && !delivery.endTime && (
                      <>
                        <button
                          onClick={() => handleUpdateClick(delivery)}
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 text-sm hover:bg-green-600"
                        >
                          Update
                        </button>
                      </>
                    )}
                    {delivery.endTime && (
                      <span className="text-gray-500 text-sm">Finished</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deliveries.length === 0 && !loading && (
        <p className="mt-4 text-gray-500">No deliveries assigned yet.</p>
      )}

      {loading && <p className="mt-2">Loading...</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Update Delivery</h3>
            
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Location</label>
                <input
                  type="text"
                  value={updateForm.currentLocation}
                  onChange={(e) => setUpdateForm({ ...updateForm, currentLocation: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter current location"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={updateForm.startTime ? new Date(updateForm.startTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, startTime: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={updateForm.endTime ? new Date(updateForm.endTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, endTime: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPanel;