interface Driver {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  currentDelivery: string | null;
}

import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

const Drivers = () => {
  const { sendRequest, loading, error } = useApi();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const result = await sendRequest("/api/delivery/drivers", "GET");
    if (result) setDrivers(result);
    console.log(result)
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Drivers</h2>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Age</th>
            <th className="p-2 border">Available</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d._id}>
              <td className="p-2 border">{d.username}</td>
              <td className="p-2 border">{d.email}</td>
              <td className="p-2 border">{d.phone || "-"}</td>
              <td className="p-2 border">{d.age || "-"}</td>
              <td className="p-2 border">{d.currentDelivery ? "No" : "Yes"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p className="mt-2">Loading...</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
};

export default Drivers;
