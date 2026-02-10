import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireGarage?: boolean;
}

export function ProtectedRoute({ children, requireGarage = false }: ProtectedRouteProps) {
  const { user, profile, garage, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not a garage owner
  if (profile && profile.role !== 'garage_owner') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="dashboard-card p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">Geen toegang</h2>
          <p className="text-muted-foreground">
            Dit portaal is alleen toegankelijk voor garage-eigenaren.
          </p>
        </div>
      </div>
    );
  }

  // Needs garage setup but doesn't have one
  if (requireGarage && !garage) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
