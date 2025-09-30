import userContext from "../context/userContext";
import { useContext } from "react";

export const useUser = () => useContext(userContext);

export default useUser;