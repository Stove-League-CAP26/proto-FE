// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/common/Layout";
import MainPage from "./pages/MainPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import BestPlayerPage from "./pages/BestPlayerPage";
import ComparePage from "./pages/ComparePage";
import TeamPage from "./pages/TeamPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AiTestPage from "./pages/AiTestPage"; // ai 테스트용

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <MainPage /> },
      { path: "/player", element: <PlayerProfilePage /> },
      { path: "/best", element: <BestPlayerPage /> },
      { path: "/compare", element: <ComparePage /> },
      { path: "/team", element: <TeamPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/ai-test", element: <AiTestPage /> }, // ai 테스트용
    ],
  },
]);
