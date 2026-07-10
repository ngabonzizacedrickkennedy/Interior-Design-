import { useAuth } from "../auth/AuthContext";
import { ClientDashboard } from "./ClientDashboard";
import { DesignerDashboard } from "./DesignerDashboard";

export function DashboardRouter() {
  const { user } = useAuth();
  return user?.role === "STAFF" ? <DesignerDashboard /> : <ClientDashboard />;
}
