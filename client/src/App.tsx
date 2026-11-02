import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import WelcomePage from "./pages/Welcome";
import TodayPage from "./pages/Today";
import HistoryPage from "./pages/History";
import PlanPage from "./pages/Plan";
import LearnPage from "./pages/Learn";
import ProfilePage from "./pages/Profile";
import Layout from "./components/Layout";
import OnboardingGate from "./components/OnboardingGate";

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/welcome" element={<Protected><WelcomePage /></Protected>} />
      <Route element={<Protected><OnboardingGate><Layout /></OnboardingGate></Protected>}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}