import { createContext } from "react";

export interface IUser {
    username: string;
    email: string;
    password: string;
    location: string;
    role: string;
    age: number;
}

export interface IUserContext {
    user: IUser | null;
    setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const userContext = createContext<IUserContext | null>(null);

export default userContext;