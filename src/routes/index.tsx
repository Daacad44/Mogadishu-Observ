import { lazy } from "react";

const HomePage = lazy(() => import("@/pages/home"));
const MapPage = lazy(() => import("@/pages/map"));
const PredictionPage = lazy(() => import("@/pages/prediction"));
const ReportsPage = lazy(() => import("@/pages/reports"));
const AboutPage = lazy(() => import("@/pages/about"));
const ContactPage = lazy(() => import("@/pages/contact"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const ProfilePage = lazy(() => import("@/pages/profile"));

const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminUpload = lazy(() => import("@/pages/admin/upload"));
const AdminLayers = lazy(() => import("@/pages/admin/layers"));
const AdminPredictions = lazy(() => import("@/pages/admin/predictions"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminMessages = lazy(() => import("@/pages/admin/messages"));

/** Public web routes — available to all users without admin dashboard. */
export const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/map", element: <MapPage /> },
  { path: "/prediction", element: <PredictionPage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/profile", element: <ProfilePage /> },
];

/** Admin routes — nested under AdminShell (admin & super_admin only). */
export const adminRoutes = {
  path: "/admin",
  children: [
    { path: "", index: true, element: <AdminDashboard /> },
    { path: "upload", element: <AdminUpload /> },
    { path: "layers", element: <AdminLayers /> },
    { path: "predictions", element: <AdminPredictions /> },
    { path: "users", element: <AdminUsers /> },
    { path: "analytics", element: <AdminAnalytics /> },
    { path: "messages", element: <AdminMessages /> },
  ],
};
