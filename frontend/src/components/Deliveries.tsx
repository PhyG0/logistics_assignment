import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import type { IUser } from "../context/userContext";
import toast from "react-hot-toast";
import useUser from "../hooks/useUser";
import type { IUserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import type { ILocation } from "./searchLocation";
import { Package, Truck, MapPin, User, CheckCircle, Clock, AlertCircle } from "lucide-react";

export interface IVehicle {
  _id: string;
  number: string;
  type: string;
  capacity: number;
}

export interface IDelivery {
  _id: string;
  vehicle: IVehicle | null;
  driver: IUser | null;
  receiver: IUser | null;
  startLocation: ILocation;
  endLocation: ILocation;
  currentLocation?: ILocation;
  startTime: number;
  endTime: number;
}

export interface IMessage {
  from: string;
  to: string;
  type: string;
  data: IDelivery;
}

const Deliveries = ({ setCurrentDelivery }: { setCurrentDelivery?: (d: IDelivery | null) => void }) => {
  const { sendRequest, loading, error } = useApi();
  const { on, off } = useSocket();
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [updatedId, setUpdatedId] = useState<string | null>(null);
  const { user } = useUser() as IUserContext;
  const navigate = useNavigate();

  if (!user) navigate("/login");

  useEffect(() => {
    fetchDeliveries();

    const handleMessage = (msg: IMessage) => {
      if (msg.type === "update" && msg.data) {
        setDeliveries((prev) => {
          const index = prev.findIndex((d) => d._id === msg.data._id);
          if (index !== -1) {
            return [...prev.slice(0, index), msg.data, ...prev.slice(index + 1)];
          }
          return prev;
        });

        setUpdatedId(msg.data._id);
        setTimeout(() => setUpdatedId(null), 2000);
        toast.success("Delivery updated");
      } else if (msg.type === "new-delivery" && msg.data) {
        toast.success("New delivery created!");
        fetchDeliveries(msg.data._id);
      }
    };

    on("message", handleMessage);
    return () => off("message", handleMessage);
  }, []);

  useEffect(() => {
    if (setCurrentDelivery) {
      const current = deliveries.find((d) => d.receiver?._id === user?.id && !d.endTime);
      setCurrentDelivery(current || null);
    }
  }, [deliveries, setCurrentDelivery, user?.id]);

  const fetchDeliveries = async (highlightId?: string) => {
    const result = await sendRequest("/api/delivery", "GET");
    if (!result) return;

    let filtered = result;
    if (user?.role === "user") {
      filtered = result.filter((d: IDelivery) => d.receiver?._id === user.id);
    } else if (user?.role === "driver") {
      filtered = result.filter((d: IDelivery) => d.driver?._id === user.id);
    }

    setDeliveries(filtered);

    if (highlightId) {
      setUpdatedId(highlightId);
      setTimeout(() => setUpdatedId(null), 2000);
    }
  };

  const getStatusConfig = (d: IDelivery) => {
    if (d.endTime) {
      return {
        label: "Completed",
        icon: CheckCircle,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        iconColor: "text-emerald-500"
      };
    }
    if (d.startTime) {
      return {
        label: "In Progress",
        icon: Truck,
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        iconColor: "text-blue-500"
      };
    }
    return {
      label: "Pending",
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      iconColor: "text-amber-500"
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800">Deliveries</h2>
          </div>
          <p className="text-slate-600 ml-14">Track and manage all your delivery orders</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {deliveries.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No deliveries found</h3>
            <p className="text-slate-500">Your deliveries will appear here once they're created</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {deliveries.map((d) => {
              const statusConfig = getStatusConfig(d);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={d._id}
                  className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                    updatedId === d._id 
                      ? "ring-4 ring-green-400 ring-opacity-50 border-green-400 scale-[1.02]" 
                      : "border-slate-200"
                  }`}
                >
                  {/* Status Banner */}
                  <div className={`${statusConfig.bgColor} border-b ${statusConfig.borderColor} px-5 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                      <span className={`font-semibold text-sm ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">{d.vehicle?.number || "Unassigned"}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    {/* Vehicle Info */}
                    {d.vehicle && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vehicle</span>
                          <span className="text-sm font-semibold text-slate-700">{d.vehicle.type}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Capacity: {d.vehicle.capacity} units
                        </div>
                      </div>
                    )}

                    {/* People Info */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Driver</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {d.driver?.username || "Not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Receiver</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {d.receiver?.username || "Not assigned"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500">From</p>
                          <p className="text-sm text-slate-700 line-clamp-2">{d.startLocation?.formatted}</p>
                        </div>
                      </div>

                      {d.currentLocation && d.startTime && !d.endTime && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-500">Current Location</p>
                            <p className="text-sm text-slate-700 line-clamp-2">{d.currentLocation.formatted}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500">To</p>
                          <p className="text-sm text-slate-700 line-clamp-2">{d.endLocation?.formatted}</p>
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
    </div>
  );
};

export default Deliveries;