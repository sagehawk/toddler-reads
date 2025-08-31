import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/AuthContext";

export const ProtectedRoute = (props: any) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Route {...props} />;
};
