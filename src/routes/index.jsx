import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Search from "../pages/Search";
import Inbox from "../pages/Inbox";
import Tasks from "../pages/Tasks";
import Team from "../pages/Team";
import MineDesignIntro from "../pages/mine-design/Intro";
import MineDesignAbout from "../pages/mine-design/About";
import PurwebIntro from "../pages/purweb/Intro";

const AppRoutes = () => {
  const routes = useRoutes([
    { path: "/", element: <Navigate to="/dashboard" replace /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/search", element: <Search /> },
    { path: "/inbox", element: <Inbox /> },
    { path: "/tasks", element: <Tasks /> },
    { path: "/team", element: <Team /> },
    { path: "/mine-design/intro", element: <MineDesignIntro /> },
    { path: "/mine-design/about", element: <MineDesignAbout /> },
    { path: "/purweb/intro", element: <PurwebIntro /> },
  ]);

  return routes;
};

export default AppRoutes;
