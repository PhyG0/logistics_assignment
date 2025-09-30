import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { Link } from "react-router-dom";

export const UserRegister = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const { data, error, loading, sendRequest } = useApi();
  const ROLE = "user";

  const handleOnRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendRequest("/api/auth/register", "POST", {
      username,
      email,
      password,
      location,
      role: ROLE,
      phone
    });
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 p-2">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">User Register</h2>

        <form onSubmit={handleOnRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
          <p className="text-center text-sm">Register as Driver ? <Link to="/driver-register" className="text-blue-500">Driver Register</Link></p>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}
        {data && (
          <p className="text-green-600 text-sm mt-3 text-center">
            Registration successful!
          </p>
        )}
      </div>
    </div>
  );
};
