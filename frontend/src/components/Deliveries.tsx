// src/components/Deliveries.tsx
import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import type { IUser } from "../context/userContext";

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

const Deliveries = () => {
  const { sendRequest, loading, error } = useApi();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    const result = await sendRequest("/api/delivery", "GET");
    if (result) setDeliveries(result);
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
            <tr key={d._id}>
              <td className="p-2 border">{d.vehicle?.number || "N/A"}</td>
              <td className="p-2 border">{d.driver?.username || "N/A"}</td>
              <td className="p-2 border">{d.receiver?.username || "N/A"}</td>
              <td className="p-2 border">{d.startLocation}</td>
              <td className="p-2 border">{d.endLocation}</td>
              <td className="p-2 border">{d.currentLocation || "N/A"}</td>
              <td className="p-2 border">{d.endTime ? "Completed" : "In Progress"}</td>
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
