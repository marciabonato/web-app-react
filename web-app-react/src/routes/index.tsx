import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

/**
 * Componente principal de rotas com RouterProvider.
 * Renderiza o grafo de rotas definido com AppLayout e Outlet.
 */
export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};
