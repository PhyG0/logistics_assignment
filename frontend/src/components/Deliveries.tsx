import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import type { IUser } from "../context/userContext";
import toast from "react-hot-toast";
import useUser from "../hooks/useUser";
import type { IUserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import type { ILocation } from "./searchLocation";

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

  return (
    <div className="p-4">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Deliveries</h2>

      {loading && <p className="text-gray-600 mb-4">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {deliveries.length === 0 && !loading ? (
        <p className="text-gray-500 text-center">No deliveries found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {deliveries.map((d) => {
            const status = d.endTime
              ? "Completed"
              : d.startTime
              ? "In Progress"
              : "Pending";
            const statusColor =
              status === "Completed"
                ? "bg-green-100 text-green-800"
                : status === "In Progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800";

            return (
              <div
                key={d._id}
                className={`rounded-2xl shadow-md border border-gray-200 p-5 bg-white transition-all hover:shadow-lg hover:-translate-y-1 ${
                  updatedId === d._id ? "ring-2 ring-green-400" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {d.vehicle?.number || "No Vehicle"}
                  </h3>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-700">Driver:</span> {d.driver?.username || "N/A"}</p>
                  <p><span className="font-medium text-gray-700">Receiver:</span> {d.receiver?.username || "N/A"}</p>
                  <p><span className="font-medium text-gray-700">Start:</span> {d.startLocation?.formatted}</p>
                  <p><span className="font-medium text-gray-700">End:</span> {d.endLocation?.formatted}</p>
                  {d.currentLocation && (
                    <p><span className="font-medium text-gray-700">Current:</span> {d.currentLocation.formatted}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deliveries;
