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
    <div className="p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4">Vehicles</h2>

      {/* Add Vehicle Form */}
      <div className="p-4 bg-white shadow rounded flex flex-wrap gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Number</label>
          <input
            type="text"
            placeholder="Number"
            value={newVehicle.number}
            onChange={(e) => setNewVehicle({ ...newVehicle, number: e.target.value })}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Type</label>
          <input
            type="text"
            placeholder="Type"
            value={newVehicle.type}
            onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Capacity (Kg)</label>
          <input
            type="number"
            placeholder="Capacity"
            value={newVehicle.capacity}
            onChange={(e) => setNewVehicle({ ...newVehicle, capacity: Number(e.target.value) })}
            className="border p-2 rounded w-24"
          />
        </div>

        <button
          onClick={handleAddVehicle}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Vehicles List (Responsive) */}
      <div className="flex flex-col gap-4">
        {vehicles.map(v => (
          <div
            key={v._id}
            className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
          >
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <p><span className="font-semibold">Number:</span> {v.number}</p>
              <p><span className="font-semibold">Type:</span> {v.type}</p>
              <p><span className="font-semibold">Capacity:</span> {v.capacity} Kg</p>
              <p>
                <span className="font-semibold">Available:</span>{" "}
                {v.currentDelivery ? "No" : "Yes"}
              </p>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && !loading && (
          <p className="text-gray-500">No vehicles available.</p>
        )}

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default Vehicles;
