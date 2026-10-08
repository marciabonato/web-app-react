import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { AboutPage } from './AboutPage';
import { renderWithProviders } from '../test/test-utils';

describe('AboutPage - Testes de Componente', () => {
  it('deve renderizar o título principal e os cards de pilares do design nórdico', () => {
    renderWithProviders(<AboutPage />);

    expect(
      screen.getByRole('heading', { name: /o conceito nórdico de bem-estar/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/conexão com a natureza/i)).toBeInTheDocument();
    expect(screen.getByText(/aproveitamento de luz/i)).toBeInTheDocument();
    expect(screen.getByText(/minimalismo funcional/i)).toBeInTheDocument();
    expect(screen.getByText(/acolhimento & afeto/i)).toBeInTheDocument();
  });
});
