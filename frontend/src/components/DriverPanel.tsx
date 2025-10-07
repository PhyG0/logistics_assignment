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
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Play, 
  Edit, 
  Compass,
  X,
  Calendar,
  Navigation,
  AlertCircle,
  Truck
} from "lucide-react";

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
    if (delivery.endTime) {
      return {
        text: "Completed",
        icon: CheckCircle,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        iconColor: "text-emerald-500"
      };
    }
    if (delivery.startTime) {
      return {
        text: "In Progress",
        icon: Truck,
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        iconColor: "text-blue-500"
      };
    }
    return {
      text: "Pending",
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      iconColor: "text-amber-500"
    };
  };

  const toggleMapModal = () => setIsMapModalOpen(prev => !prev);

  const pendingCount = deliveries.filter(d => !d.startTime).length;
  const activeCount = deliveries.filter(d => d.startTime && !d.endTime).length;
  const completedCount = deliveries.filter(d => d.endTime).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800">My Deliveries</h2>
          </div>
          <p className="text-slate-600 ml-14">Manage your assigned delivery tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{activeCount}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{completedCount}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        )}

        {deliveries.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No deliveries assigned</h3>
            <p className="text-slate-500">Your delivery assignments will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(delivery => {
              const status = getDeliveryStatus(delivery);
              const StatusIcon = status.icon;

              return (
                <div
                  key={delivery._id}
                  className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`${status.bgColor} border-b ${status.borderColor} px-5 py-3 flex items-center justify-between flex-wrap gap-2`}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${status.iconColor}`} />
                      <span className={`font-semibold text-sm ${status.textColor}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!delivery.startTime && (
                        <button
                          onClick={() => handleStartDelivery(delivery)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
                        >
                          <Play className="w-4 h-4" />
                          Start Delivery
                        </button>
                      )}
                      {delivery.startTime && !delivery.endTime && (
                        <>
                          <button
                            onClick={() => handleUpdateClick(delivery)}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Update
                          </button>
                          <button
                            onClick={toggleMapModal}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                          >
                            <Compass className="w-4 h-4" />
                            View Map
                          </button>
                        </>
                      )}
                      {delivery.endTime && (
                        <span className="flex items-center gap-2 text-slate-500 px-4 py-2 rounded-lg bg-slate-100 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Finished
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">From</p>
                          <p className="text-sm text-slate-800">{delivery.startLocation.formatted}</p>
                        </div>
                      </div>

                      {delivery.currentLocation && delivery.startTime && !delivery.endTime && (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="p-2 bg-blue-200 rounded-lg flex-shrink-0">
                            <Navigation className="w-4 h-4 text-blue-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Current Location</p>
                            <p className="text-sm text-slate-800">{delivery.currentLocation.formatted}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                          <MapPin className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">To</p>
                          <p className="text-sm text-slate-800">{delivery.endLocation.formatted}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Start Time</p>
                          <p className="text-sm font-medium text-slate-800">
                            {delivery.startTime ? new Date(delivery.startTime).toLocaleString() : "Not started"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">End Time</p>
                          <p className="text-sm font-medium text-slate-800">
                            {delivery.endTime ? new Date(delivery.endTime).toLocaleString() : "In progress"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isMapModalOpen && currentDelivery && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4"
          onClick={toggleMapModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-6xl h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 flex justify-between items-center border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Compass className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Delivery Route</h2>
                  <p className="text-sm text-slate-600">Navigate to your destination</p>
                </div>
              </div>
              <button
                onClick={toggleMapModal}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            <div className="h-[calc(100%-80px)]">
              <Map
                A={currentDelivery.currentLocation ?? currentDelivery.startLocation}
                B={currentDelivery.endLocation}
              />
            </div>
          </div>
        </div>
      )}

      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Update Delivery</h3>
                  <p className="text-sm text-slate-600">Update your delivery progress</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Location
                </label>
                  <SearchLocation
                    onSelectLocation={(loc) => setUpdateForm({ ...updateForm, currentLocation: loc })}
                  />
                {updateForm.currentLocation && (
                  <p className="mt-2 text-sm text-slate-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    {updateForm.currentLocation.formatted}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={safeDateValue(updateForm.startTime)}
                  onChange={e => setUpdateForm({ ...updateForm, startTime: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={safeDateValue(updateForm.endTime)}
                  onChange={e => setUpdateForm({ ...updateForm, endTime: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Delivery"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPanel;