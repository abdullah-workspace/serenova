import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../ui/Loading.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) return <Loading />;
  if (!auth.user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
