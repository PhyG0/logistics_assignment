import userContext from "./userContext"
import { useState } from "react"
import type { IUser } from "./userContext"

const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<IUser | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    return (
        <userContext.Provider value={{  user, setUser, isLoggedIn, setIsLoggedIn}}>
            {children}
        </userContext.Provider>
    )
}

export default UserProvider