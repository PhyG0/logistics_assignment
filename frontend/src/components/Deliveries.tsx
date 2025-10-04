import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import type { IUser } from "../context/userContext";
import toast from "react-hot-toast";
import useUser from "../hooks/useUser";
import type { IUserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

export interface IVehicle {
  _id: string;
  number: string;
  type: string;
  capacity: number;
}

interface Delivery {
  _id: string;
  vehicle: IVehicle;
  driver: IUser;
  receiver: IUser;
  startLocation: string;
  endLocation: string;
  currentLocation?: string;
  startTime: number;
  endTime: number;
}

interface IDelivery {
  _id: string;
  vehicle: string;
  driver: string;
  receiver: string;
  startLocation: string;
  endLocation: string;
  currentLocation?: string;
  startTime: number;
  endTime: number;
}

export interface IMessage {
  from: string;
  to: string;
  type: string; 
  data: IDelivery;
}

const Deliveries = () => {
  const { sendRequest, loading, error } = useApi();
  const { on, off } = useSocket(); 
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [updatedId, setUpdatedId] = useState<string | null>(null);
  const { user } = useUser() as IUserContext;
  const navigate = useNavigate();

  if (!user) navigate("/login");

  useEffect(() => {
    fetchDeliveries();

    const handleMessage = (msg: IMessage) => {
      if (msg.type === "update" && msg.data) {
        setDeliveries((prev) =>
          prev.map((delivery) => {
            if (delivery._id === msg.data._id) {
              return { 
                ...delivery, 
                currentLocation: msg.data.currentLocation, 
                endTime: msg.data.endTime 
              };
            }
            return delivery;
          })
        );

        setUpdatedId(msg.data._id);
        setTimeout(() => setUpdatedId(null), 2000);

        toast.success("Delivery updated");
      } 
      else if (msg.type === "new-delivery" && msg.data) {
        toast.success("New delivery created!");

        // Re-fetch deliveries and highlight the new one
        fetchDeliveries(msg.data._id);
      }
    };

    on("message", handleMessage);
    return () => off("message", handleMessage);
  }, []);

  const fetchDeliveries = async (highlightId?: string) => {
    const result = await sendRequest("/api/delivery", "GET");
    if (!result) return;

    let filtered = result;
    if (user?.role === "user") {
      filtered = result.filter((d: Delivery) => d.receiver.id === user.id);
    } else if (user?.role === "driver") {
      filtered = result.filter((d: Delivery) => d.driver.id === user.id);
    }

    setDeliveries(filtered);

    if (highlightId) {
      setUpdatedId(highlightId);
      setTimeout(() => setUpdatedId(null), 2000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Deliveries</h2>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Vehicle</th>
            <th className="p-2 border">Driver</th>
            <th className="p-2 border">Receiver</th>
            <th className="p-2 border">Start</th>
            <th className="p-2 border">End</th>
            <th className="p-2 border">Current Location</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => (
            <tr
              key={d._id}
              className={`transition-colors duration-500 ${
                updatedId === d._id ? "bg-green-200" : ""
              }`}
            >
              <td className="p-2 border">{d.vehicle?.number || "N/A"}</td>
              <td className="p-2 border">{d.driver?.username || "N/A"}</td>
              <td className="p-2 border">{d.receiver?.username || "N/A"}</td>
              <td className="p-2 border">{d.startLocation}</td>
              <td className="p-2 border">{d.endLocation}</td>
              <td className="p-2 border">{d.currentLocation || "N/A"}</td>
              <td className="p-2 border">
                {d.endTime ? "Completed" : d.startTime ? "In Progress" : "Pending"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p className="mt-2">Loading...</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
};

export default Deliveries;
