import { useState } from "react";
import { useApi } from "../hooks/useApi";
import useUser from "../hooks/useUser";
import type { IUserContext } from "../context/userContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { data, error, loading, sendRequest } = useApi();
  const { setUser, setIsLoggedIn } = useUser() as IUserContext;
  const navigate = useNavigate();

  const handleOnLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendRequest("/api/auth/login", "POST", {
      email,
      password,
    });
    if (result) {
      setUser(result.user);
      setIsLoggedIn(true);
      localStorage.setItem("token", result.token);
      navigate("/")
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <form onSubmit={handleOnLogin} className="flex flex-col gap-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-sm text-center">Don't have an account? <Link to="/user-register" className="text-blue-500">Register</Link></p>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}
        {data && (
          <p className="text-green-600 text-sm mt-3 text-center">
            Login successful!
          </p>
        )}
      </div>
    </div>
  );
};
