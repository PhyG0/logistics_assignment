import type { IUserContext } from "../context/userContext";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
    const { user, setUser, setIsLoggedIn } = useUser() as IUserContext;
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("token");
        navigate("/login");
    }

    return ( 
        <nav className="bg-gray-800 p-4 flex justify-between items-center text-white"> 
            <div className="flex items-center justify-center align-center">
                <h1 className="text-lg font-bold">Logistics</h1>
                <p className="ml-2 text-sm font-semibold text-gray-400">Delivery</p>
            </div>
            <div className="flex items-center">
                <p className="mr-4">{user ? user.username : "Logistics"}</p>
                {user && 
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                }
            </div>
        </nav>
    );

}