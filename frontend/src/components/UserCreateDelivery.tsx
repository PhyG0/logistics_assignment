import { useState } from "react";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";
import { SearchLocation, type ILocation } from "./searchLocation";

const UserCreateDelivery = () => {
  const { sendRequest, loading, error } = useApi();

  const [formData, setFormData] = useState({
    message: "", 
    endLocation: "" as unknown as ILocation
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.endLocation || !formData.endLocation.formatted) {
      toast.error("Please select a valid endLocation");
      return;
    }
    const result = await sendRequest("/api/delivery/request", "POST", formData);
    if (result) {
      toast.success("Delivery request created successfully!");
      setFormData({
        message: "",
        endLocation: "" as unknown as ILocation
      });
    }
  };

  const handleLocationSelect = (location: ILocation) => {
    setFormData({ ...formData, endLocation: location });
  }

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Request Delivery</h2>

      <div className="grid gap-4">
        <div>
          <label className="block font-medium mb-1">Destination *</label>
          <SearchLocation onSelectLocation={handleLocationSelect} />
  
        </div>

        <div>
          <label className="block font-medium mb-1">Message (Optional)</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Add any special instructions or notes"
            className="w-full border p-2 rounded h-24"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Request Delivery"}
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default UserCreateDelivery;