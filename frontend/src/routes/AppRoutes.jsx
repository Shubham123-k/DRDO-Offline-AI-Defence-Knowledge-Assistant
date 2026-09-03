import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Chat from "../pages/Chat";
import Admin from "../pages/Admin";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import PendingApproval from "../pages/PendingApproval";
import ForgotPassword from "../pages/ForgotPassword";

import ProtectedRoute from "./ProtectedRoute";
import Settings from "../pages/Settings";
import Help from "../pages/Help";
import EditUser from "../pages/EditUser";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/edit-user" element={<EditUser />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}