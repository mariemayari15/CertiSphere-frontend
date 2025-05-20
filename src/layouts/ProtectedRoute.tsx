import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface TokenPayload {
  exp?: number;
  role?: string;
}

interface ProtectedRouteProps {
  redirectPath: string;
  requiredRole?: 'admin' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath,
  requiredRole,
}) => {
  const location = useLocation();
  const token = localStorage.getItem('authToken');

  if (!token) {
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{ from: location }}
      />
    );
  }

  try {
    const { exp, role } = jwtDecode<TokenPayload>(token);

    
    if (exp && exp * 1000 < Date.now()) {
      localStorage.removeItem('authToken');
      return (
        <Navigate
          to={redirectPath}
          replace
          state={{ from: location }}
        />
      );
    }

   
    if (requiredRole && role !== requiredRole) {
      return <Navigate to={redirectPath} replace />;
    }
  } catch {
    
    localStorage.removeItem('authToken');
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{ from: location }}
      />
    );
  }

  
  return <Outlet />;
};

export default ProtectedRoute;
