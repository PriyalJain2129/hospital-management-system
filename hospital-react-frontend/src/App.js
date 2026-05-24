import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Layout from "./components/Layout";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/patients" element={<PrivateRoute><Layout><Patients /></Layout></PrivateRoute>} />
        <Route path="/doctors" element={<PrivateRoute><Layout><Doctors /></Layout></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><Layout><Appointments /></Layout></PrivateRoute>} />
        <Route path="/billing" element={<PrivateRoute><Layout><Billing /></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
