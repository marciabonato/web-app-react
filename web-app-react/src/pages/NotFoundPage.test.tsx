import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { NotFoundPage } from './NotFoundPage';
import { renderWithProviders } from '../test/test-utils';

describe('NotFoundPage - Testes de Componente', () => {
  it('deve renderizar o código 404, o título e o botão de retorno à home', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /página não encontrada/i }),
    ).toBeInTheDocument();

    const homeButton = screen.getByRole('link', {
      name: /voltar para a página inicial/i,
    });
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('href', '/');
  });
});
