import { useEffect } from "react";
import type { IUserContext } from "../context/userContext";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import AdminPanel from "./AdminPanel";
import DriverPanel from "./DriverPanel";
import Deliveries from "./Deliveries";

export default function Home() {

    const navigate = useNavigate();
    const { user } = useUser() as IUserContext;

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-200">
            {user?.role === "admin" && <AdminPanel />}
            {user?.role === "driver" && <DriverPanel />}
            {user?.role === "user" && <Deliveries />}
        </div>
    );
}
