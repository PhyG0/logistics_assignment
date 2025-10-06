import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import useUser from "../hooks/useUser";
import type { IUserContext } from "../context/userContext";
import toast from "react-hot-toast";
import type { IDelivery } from "./Deliveries";
import type { ILocation } from "./searchLocation";
import { SearchLocation } from "./searchLocation";
import Map from "./Map";

export interface IMessage {
  from: string;
  to: string;
  type: string;
  data: IDelivery;
}

const DriverPanel = () => {
  const { sendRequest, loading, error } = useApi();
  const { user } = useUser() as IUserContext;
  const { emit, on, off } = useSocket();

  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
  const [updateForm, setUpdateForm] = useState<{
    currentLocation: ILocation | null;
    startTime: string;
    endTime: string;
  }>({
    currentLocation: null,
    startTime: "",
    endTime: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState<IDelivery | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const safeDateValue = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchDeliveries();

    const handleMessage = (data: IMessage) => {
      if (data.to !== "driver") return;
      if (data.type === "new-delivery") {
        setDeliveries((prev) => [...prev, data.data]);
        toast.success("New delivery created!");
      }
    };

    on("message", handleMessage);
    return () => off("message", handleMessage);
  }, []);

  useEffect(() => {
    const active = deliveries.find((d) => d.startTime && !d.endTime);
    setCurrentDelivery(active || null);
  }, [deliveries]);

  const fetchDeliveries = async () => {
    const result = await sendRequest("/api/delivery", "GET");
    if (result) {
      const driverDeliveries = result.filter(
        (d: IDelivery) => d?.driver?._id === user?.id
      );
      setDeliveries(driverDeliveries);
    }
  };

  const emitMessage = (message: IMessage) => emit("message", message);

  const handleUpdateClick = (delivery: IDelivery) => {
    setSelectedDelivery(delivery);
    setUpdateForm({
      currentLocation: delivery.currentLocation || null,
      startTime: delivery.startTime
        ? new Date(delivery.startTime).toISOString()
        : "",
      endTime: delivery.endTime
        ? new Date(delivery.endTime).toISOString()
        : "",
    });
    setShowModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);

    const updateData: {
      deliveryId: string | undefined;
      currentLocation?: ILocation | null;
      startTime?: string;
      endTime?: string;
    } = {
      deliveryId: selectedDelivery?._id,
    };

    if (updateForm.currentLocation)
      updateData.currentLocation = updateForm.currentLocation;
    if (updateForm.startTime) updateData.startTime = updateForm.startTime;
    if (updateForm.endTime) updateData.endTime = updateForm.endTime;

    const result = await sendRequest("/api/delivery", "PUT", updateData);

    setUpdateLoading(false);

    if (result) {
      setDeliveries(prev => prev.map(d => d._id === result._id ? result : d));
      if (currentDelivery?._id === result._id) setCurrentDelivery(result);
      setShowModal(false);
      emitMessage({ from: user?.id as string, to: "admin", type: "update", data: result });
    }
  };

  const handleStartDelivery = (delivery: IDelivery) => {
    setSelectedDelivery(delivery);
    setUpdateForm({
      currentLocation: delivery.currentLocation || null,
      startTime: new Date().toISOString(),
      endTime: "",
    });
    setShowModal(true);
  };

  const getDeliveryStatus = (delivery: IDelivery) => {
    if (delivery.endTime)
      return { text: "Completed", color: "bg-green-100 text-green-800" };
    if (delivery.startTime)
      return { text: "In Progress", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Pending", color: "bg-gray-100 text-gray-800" };
  };

  const toggleMapModal = () => setIsMapModalOpen(prev => !prev);

  return (
    <div className="p-4 flex flex-col min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">My Deliveries</h2>

      {/* Responsive deliveries */}
      <div className="flex flex-col gap-4">
        {deliveries.map(delivery => {
          const status = getDeliveryStatus(delivery);
          return (
            <div key={delivery._id} className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p><span className="font-semibold">From:</span> {delivery.startLocation.formatted}</p>
                <p><span className="font-semibold">To:</span> {delivery.endLocation.formatted}</p>
                <p><span className="font-semibold">Current:</span> {delivery.currentLocation?.formatted || "-"}</p>
                <p className={`inline-block mt-1 px-2 py-1 rounded text-sm ${status.color}`}>{status.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start: {delivery.startTime ? new Date(delivery.startTime).toLocaleString() : "-"} | 
                  End: {delivery.endTime ? new Date(delivery.endTime).toLocaleString() : "-"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                {!delivery.startTime && (
                  <button
                    onClick={() => handleStartDelivery(delivery)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Start
                  </button>
                )}
                {delivery.startTime && !delivery.endTime && (
                  <>
                    <button
                      onClick={() => handleUpdateClick(delivery)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={toggleMapModal}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View Map
                    </button>
                  </>
                )}
                {delivery.endTime && (
                  <span className="text-gray-500 px-3 py-1 rounded bg-gray-100">Finished</span>
                )}
              </div>
            </div>
          );
        })}

        {deliveries.length === 0 && !loading && (
          <p className="text-gray-500 mt-4">No deliveries assigned yet.</p>
        )}

        {loading && <p className="mt-2">Loading...</p>}
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </div>

      {/* Map Modal */}
      {isMapModalOpen && currentDelivery && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={toggleMapModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full h-[80vh] sm:h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Delivery Route</h2>
              <button onClick={toggleMapModal} className="text-gray-500 hover:text-gray-700">Close</button>
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

      {/* Update Delivery Modal */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Update Delivery</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Location</label>
                <SearchLocation
                  onSelectLocation={(loc) => setUpdateForm({ ...updateForm, currentLocation: loc })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={safeDateValue(updateForm.startTime)}
                  onChange={e => setUpdateForm({ ...updateForm, startTime: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={safeDateValue(updateForm.endTime)}
                  onChange={e => setUpdateForm({ ...updateForm, endTime: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100" disabled={updateLoading}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={updateLoading}>
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
