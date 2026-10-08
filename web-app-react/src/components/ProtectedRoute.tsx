/**
 * src/components/ProtectedRoute.tsx
 *
 * Componente de proteção de rotas privadas (área administrativa / painel).
 * Utiliza o hook useAuth para validar o estado da sessão.
 * Caso o usuário não esteja logado, redireciona programaticamente via useNavigate().
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Guarda de rota autenticada.
 * Redireciona usuários não autenticados para a rota de login, preservando a URL de origem.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redireciona programaticamente via useNavigate apenas quando o carregamento inicial terminar
    if (!isLoading && !isAuthenticated && location.pathname !== redirectTo) {
      navigate(redirectTo, {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, location]);

  // Exibe indicador de carregamento enquanto valida o token com o servidor
  if (isLoading) {
    return (
      <Center style={{ minHeight: '60vh', width: '100%' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" color="forest" type="dots" />
          <Text size="sm" c="#6b5e4c" fw={500}>
            Verificando credenciais de acesso...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Enquanto o redirecionamento ocorre, não renderiza o conteúdo restrito
  if (!isAuthenticated) {
    return null;
  }

  // Renderiza filhos diretos ou Outlet do React Router
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
