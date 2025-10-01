import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";

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

const CreateDelivery = () => {
  const { sendRequest, loading, error } = useApi();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { emit } = useSocket();

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    driverEmail: "",
    receiverEmail: "",
    startLocation: "",
    endLocation: "",
    currentLocation: ""
  });

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchUsers();
  }, []);

  const fetchVehicles = async () => {
    const result = await sendRequest("/api/vehicle", "GET");
    if (result) setVehicles(result);
  };

  const fetchDrivers = async () => {
    const result = await sendRequest("/api/delivery/drivers", "GET");
    if (result) setDrivers(result);
  };

  const fetchUsers = async () => {
    const result = await sendRequest("/api/delivery/users", "GET"); 
    if (result) setUsers(result);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const result = await sendRequest("/api/delivery", "POST", formData);
    if (result) {
      toast.success("Delivery created successfully!");
      setFormData({
        vehicleNumber: "",
        driverEmail: "",
        receiverEmail: "",
        startLocation: "",
        endLocation: "",
        currentLocation: ""
      });
      fetchVehicles();
      fetchDrivers();
      emit("message", {from: "admin", to: "driver", type: "new-delivery", data: result});
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Delivery</h2>

      <div className="grid gap-4">
        {/* Vehicle */}
        <div>
          <label className="block font-medium mb-1">Vehicle</label>
          <select
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v._id} value={v.number} disabled={!!v.currentDelivery}>
                {v.number} {v.currentDelivery ? "(In Use)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Driver */}
        <div>
          <label className="block font-medium mb-1">Driver</label>
          <select
            name="driverEmail"
            value={formData.driverEmail}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Driver</option>
            {drivers.map(d => (
              <option key={d._id} value={d.email} disabled={!!d.currentDelivery}>
                {d.username} {d.currentDelivery ? "(Busy)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Receiver */}
        <div>
          <label className="block font-medium mb-1">Receiver</label>
          <select
            name="receiverEmail"
            value={formData.receiverEmail}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Receiver</option>
            {users.map(u => (
              <option key={u._id} value={u.email}>
                {u.username}
              </option>
            ))}
          </select>
        </div>

        {/* Locations */}
        <div>
          <label className="block font-medium mb-1">Start Location</label>
          <input
            name="startLocation"
            value={formData.startLocation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">End Location</label>
          <input
            name="endLocation"
            value={formData.endLocation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Current Location (optional)</label>
          <input
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Delivery"}
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default CreateDelivery;
