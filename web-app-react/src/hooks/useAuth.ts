/**
 * src/hooks/useAuth.ts
 *
 * Custom Hook dedicado para consumir o AuthContext.
 * Inclui validação explícita para garantir que o hook seja invocado
 * exclusivamente sob a árvore de um <AuthProvider />.
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

/**
 * Retorna as propriedades e métodos de autenticação da aplicação.
 *
 * @throws {Error} Caso seja utilizado fora de um `<AuthProvider />`.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      '[useAuth] O hook useAuth deve ser utilizado obrigatoriamente dentro de um <AuthProvider />.',
    );
  }

  return context;
};

export default useAuth;
