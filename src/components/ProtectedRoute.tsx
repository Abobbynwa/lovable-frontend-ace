import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isVerified } = useAuth();

  if (!isVerified) {
    return <Navigate to="/send-code" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
