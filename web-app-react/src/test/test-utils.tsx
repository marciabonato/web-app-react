/**
 * src/test/test-utils.tsx
 *
 * Utilitários de teste com wrappers de contexto em memória (MantineProvider,
 * MemoryRouter e AuthProvider) para testes isolados e reproduzíveis.
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { theme } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries'];
  withAuth?: boolean;
  withRouter?: boolean;
}

export interface ExtendedRenderResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
}

/**
 * Renderiza um componente envolvendo-o com os provedores necessários
 * (MantineProvider, MemoryRouter, AuthProvider) em ambiente isolado.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
): ExtendedRenderResult {
  const {
    initialEntries = ['/'],
    withAuth = true,
    withRouter = true,
    ...renderOptions
  } = options;

  const user = userEvent.setup();

  function Wrapper({ children }: { children: React.ReactNode }): ReactElement {
    let content = children;

    if (withAuth) {
      content = <AuthProvider>{content}</AuthProvider>;
    }

    if (withRouter) {
      content = <MemoryRouter initialEntries={initialEntries}>{content}</MemoryRouter>;
    }

    return <MantineProvider theme={theme}>{content}</MantineProvider>;
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    user,
  };
}

export * from '@testing-library/react';
export { userEvent };
