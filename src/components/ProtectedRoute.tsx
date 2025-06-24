import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();

  // Adicionando um log para depuração
  console.log('ProtectedRoute Check:', { isAuthenticated, user: !!user });

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login.
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza o Layout que por sua vez renderizará a página aninhada (filha).
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute; 