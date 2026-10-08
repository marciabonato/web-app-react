/**
 * src/services/api.ts
 *
 * Instância centralizada do Axios configurada para a API DummyJSON.
 *
 * Responsabilidades:
 *  - Definir a baseURL e cabeçalhos padrão
 *  - Interceptor de REQUISIÇÃO: injeta automaticamente o JWT do storage
 *  - Interceptor de RESPOSTA: captura erros de rede e status 401/403
 *    com mensagens amigáveis em Português
 */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Chave usada para persistir o JWT no localStorage / sessionStorage */
const JWT_STORAGE_KEY = 'auth_token';

/** Tempo máximo (ms) para aguardar resposta da API antes de abortar */
const REQUEST_TIMEOUT_MS = 12_000;

// ─── Instância principal ────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Helpers de storage ─────────────────────────────────────────────────────────

/**
 * Retorna o JWT armazenado, priorizando sessionStorage (sessão efêmera)
 * e caindo para localStorage (sessão persistente/"lembrar-me").
 */
function getStoredToken(): string | null {
  return (
    sessionStorage.getItem(JWT_STORAGE_KEY) ??
    localStorage.getItem(JWT_STORAGE_KEY)
  );
}

/**
 * Persiste o JWT.
 * @param token  O token a salvar.
 * @param persist `true` → localStorage (lembrar-me); `false` → sessionStorage.
 */
export function saveToken(token: string, persist = false): void {
  const storage = persist ? localStorage : sessionStorage;
  storage.setItem(JWT_STORAGE_KEY, token);
}

/** Remove o JWT de ambos os storages (logout completo). */
export function clearToken(): void {
  localStorage.removeItem(JWT_STORAGE_KEY);
  sessionStorage.removeItem(JWT_STORAGE_KEY);
}

// ─── Interceptor de REQUISIÇÃO ──────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getStoredToken();

    if (token) {
      // Injeta o cabeçalho de autorização apenas se houver token
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => {
    // Erros de configuração (ex.: URL inválida) são repassados diretamente
    return Promise.reject(error);
  },
);

// ─── Tipagem de erro de API ─────────────────────────────────────────────────────

/** Estrutura de erro retornada pela DummyJSON em respostas de falha */
export interface ApiErrorPayload {
  message?: string;
}

/**
 * Erro enriquecido lançado pelos interceptors.
 * Garante que os componentes sempre recebam uma `userMessage` legível.
 */
export class ApiError extends Error {
  public readonly status: number | null;
  public readonly userMessage: string;

  constructor(userMessage: string, status: number | null, originalError: unknown) {
    super(userMessage);
    this.name = 'ApiError';
    this.status = status;
    this.userMessage = userMessage;

    // Mantém o stack trace original quando possível
    if (originalError instanceof Error && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

// ─── Mapeamento de status para mensagens amigáveis ──────────────────────────────

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Sessão expirada ou não autenticado. Faça login novamente.',
  403: 'Você não tem permissão para acessar este recurso.',
  404: 'Recurso não encontrado.',
  408: 'A requisição demorou muito. Verifique sua conexão.',
  422: 'Dados inválidos enviados ao servidor.',
  429: 'Muitas requisições em pouco tempo. Aguarde um momento.',
  500: 'Erro interno do servidor. Tente novamente em instantes.',
  502: 'Serviço temporariamente indisponível (Bad Gateway).',
  503: 'Serviço fora do ar. Tente novamente em breve.',
};

function buildUserMessage(error: AxiosError<ApiErrorPayload>): string {
  // 1. Sem resposta → problema de rede / CORS / timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    }
    return 'Erro de rede desconhecido. Tente novamente.';
  }

  const { status, data } = error.response;

  // 2. Mensagem vinda do próprio servidor (se existir e for string)
  const serverMessage =
    typeof data?.message === 'string' && data.message.trim()
      ? data.message.trim()
      : null;

  // 3. Mensagem mapeada pelo status HTTP
  const mappedMessage = STATUS_MESSAGES[status] ?? null;

  return serverMessage ?? mappedMessage ?? `Erro inesperado (HTTP ${status}).`;
}

// ─── Interceptor de RESPOSTA ────────────────────────────────────────────────────

api.interceptors.response.use(
  // Sucesso: simplesmente repassa a resposta intacta
  (response: AxiosResponse) => response,

  // Erro: normaliza e enriquece antes de propagar
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status ?? null;
    const userMessage = buildUserMessage(error);

    // Ação específica para não-autenticado / proibido
    if (status === 401 || status === 403) {
      // Remove o token inválido para forçar re-login
      clearToken();

      // Emite evento global para que o AuthContext possa reagir (logout)
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', { detail: { status } }),
      );
    }

    return Promise.reject(new ApiError(userMessage, status, error));
  },
);

// ─── Exports de conveniência ─────────────────────────────────────────────────────

export type { AxiosRequestConfig };
export default api;
