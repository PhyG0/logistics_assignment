import './App.css'
import { Login } from './components/Login'
import Home from './components/Home'
import { UserRegister } from './components/UserRegister'
import { DriverRegister } from './components/DriverRegister'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-register" element={<UserRegister />} />
        <Route path="/driver-register" element={<DriverRegister />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
