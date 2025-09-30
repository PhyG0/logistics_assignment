// src/components/Vehicles.tsx
import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

interface Vehicle {
  _id: string;
  number: string;
  type: string;
  capacity: number;
  currentDelivery: string | null;
}

const Vehicles = () => {
  const { sendRequest, loading, error } = useApi();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState({ number: "", type: "", capacity: 0 });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const result = await sendRequest("/api/vehicle", "GET");
    if (result) setVehicles(result);
  };

  const handleAddVehicle = async () => {
    const result = await sendRequest("/api/vehicle", "POST", newVehicle);
    if (result) {
      setVehicles([...vehicles, result]);
      setNewVehicle({ number: "", type: "", capacity: 0 });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vehicles</h2>

      <div className="mb-6 p-4 bg-white shadow rounded">
        <h3 className="text-lg font-semibold mb-2">Add New Vehicle</h3>
        <input
          type="text"
          placeholder="Number"
          value={newVehicle.number}
          onChange={(e) => setNewVehicle({ ...newVehicle, number: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="text"
          placeholder="Type"
          value={newVehicle.type}
          onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <label className="mr-2">Capacity (Kilograms):</label>
        <input
          type="number"
          placeholder="Capacity"
          value={newVehicle.capacity}
          onChange={(e) => setNewVehicle({ ...newVehicle, capacity: Number(e.target.value) })}
          className="border p-2 mr-2 rounded w-24"
        />
        <button onClick={handleAddVehicle} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add
        </button>
      </div>

      {/* Vehicles Table */}
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Number</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Capacity</th>
            <th className="p-2 border">Available</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v._id}>
              <td className="p-2 border">{v.number}</td>
              <td className="p-2 border">{v.type}</td>
              <td className="p-2 border">{v.capacity}</td>
              <td className="p-2 border">{v.currentDelivery ? "No" : "Yes"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p className="mt-2">Loading...</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
};

export default Vehicles;
