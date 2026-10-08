import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { AboutPage } from '../pages/AboutPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';

/**
 * Definição centralizada das rotas da aplicação utilizando React Router v7+.
 * Layout base estruturado com cabeçalho (Header) e menu de navegação persistente
 * utilizando <NavLink> e <Outlet />.
 */
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'produtos',
          element: <ProductsPage />,
        },
        {
          // Rota dinâmica para detalhes do produto capturada por useParams<{ id: string }>()
          path: 'produtos/:id',
          element: <ProductDetailPage />,
        },
        {
          path: 'login',
          element: <LoginPage />,
        },
        {
          path: 'sobre',
          element: <AboutPage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);
