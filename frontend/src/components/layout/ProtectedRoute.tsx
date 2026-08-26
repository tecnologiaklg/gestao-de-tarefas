import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/Spinner';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireRoot?: boolean;
  requireNotRoot?: boolean;
  requireCargo?: string;
}

export function ProtectedRoute({ children, requireRoot, requireNotRoot, requireCargo }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;

  const isRoot = user.role === 'ROOT';

  if (requireRoot && !isRoot) return <Navigate to="/" replace />;
  if (requireNotRoot && isRoot) return <Navigate to="/root/equipes" replace />;
  if (requireCargo && !isRoot && user.cargo !== requireCargo) return <Navigate to="/" replace />;

  return <>{children}</>;
}
