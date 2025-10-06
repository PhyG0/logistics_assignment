import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

interface Driver {
  age: string;
  _id: string;
  username: string;
  email: string;
  phone?: string;
  currentDelivery: string | null;
}

const Drivers = () => {
  const { sendRequest, loading, error } = useApi();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const result = await sendRequest("/api/delivery/drivers", "GET");
    if (result) setDrivers(result);
    console.log(result);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4">Drivers</h2>

      {/* Drivers List */}
      <div className="flex flex-col gap-4">
        {drivers.map((d) => (
          <div
            key={d._id}
            className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
          >
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <p><span className="font-semibold">Name:</span> {d.username}</p>
              <p><span className="font-semibold">Email:</span> {d.email}</p>
              <p><span className="font-semibold">Phone:</span> {d.phone || "-"}</p>
              <p><span className="font-semibold">Age:</span> {d.age || "-"}</p>
              <p>
                <span className="font-semibold">Available:</span>{" "}
                {d.currentDelivery ? "No" : "Yes"}
              </p>
            </div>
          </div>
        ))}

        {drivers.length === 0 && !loading && (
          <p className="text-gray-500">No drivers available.</p>
        )}

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default Drivers;
