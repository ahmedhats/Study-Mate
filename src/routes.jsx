import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Timer from "./pages/Timer";
import Stats from "./pages/Stats";
import StudyGroup from "./pages/StudyGroup";
import Team from "./pages/Team";
import Tasks from "./pages/Tasks";
import Search from "./pages/Search";
import Inbox from "./pages/Inbox";

const routes = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/timer",
    element: <Timer />,
  },
  {
    path: "/stats",
    element: <Stats />,
  },
  {
    path: "/study-group",
    element: <StudyGroup />,
  },
  {
    path: "/team",
    element: <Team />,
  },
  {
    path: "/tasks",
    element: <Tasks />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/inbox",
    element: <Inbox />,
  },
];

export default routes;
