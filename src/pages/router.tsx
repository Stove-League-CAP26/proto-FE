// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import Layout from "src/components/common/Layout";
import MainPage from "src/pages/MainPage";
import PlayerProfilePage from "src/pages/PlayerProfilePage";
import BestPlayerPage from "src/pages/BestPlayerPage";
import ComparePage from "src/pages/ComparePage";
import TeamPage from "src/pages/TeamPage";
import LoginPage from "src/pages/LoginPage";
import SignupPage from "src/pages/SignupPage";

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
    ],
  },
]);
