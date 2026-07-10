import { useAuth } from "../auth/AuthContext";
import { DesignPortfolio } from "./DesignPortfolio";
import { Portfolio } from "./Portfolio";

export function DesignFilesRouter() {
  const { user } = useAuth();
  return user?.role === "ADMIN" ? <Portfolio /> : <DesignPortfolio />;
}
