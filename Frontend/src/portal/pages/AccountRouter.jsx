import { useAuth } from "../auth/AuthContext";
import { Account } from "./Account";
import { DesignerAccount } from "./DesignerAccount";

export function AccountRouter() {
  const { user } = useAuth();
  return user?.role === "STAFF" ? <DesignerAccount /> : <Account />;
}
