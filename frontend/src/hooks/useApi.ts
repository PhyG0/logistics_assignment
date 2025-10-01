import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export function useApi() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const baseUrl = "http://localhost:3001";
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const sendRequest = async (
    url: string,
    method: HttpMethod = "GET",
    body?: any
  ) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(baseUrl + url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          result?.message || result?.error || `Error ${response.status}`;
        throw new Error(errorMessage);
      }

      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, sendRequest };
}