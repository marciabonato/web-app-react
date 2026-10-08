# Catálogo de Produtos e Simulador de Carrinho de Compras
Aplicação no ar:

https://github.com/marciabonato/web-app-react/deployments/github-pages
https://marciabonato.github.io/web-app-react/

Este projeto consiste em uma aplicação web dinâmica e interativa para gerenciamento de um e-commerce de itens de mobiliário de decoração. A aplicação opera consumindo a API pública **DummyJSON** (`https://dummyjson.com/products`), apresentando um ecossistema completo de compras com busca, paginação e filtros. O projeto foi desenvolvido em **React** com **TypeScript**, utilizando o **Vite** como ambiente de build rápido e moderno.

O sistema simula a jornada completa de compra de um usuário através dos seguintes módulos automatizados e componentes modulares:

- **Catálogo Interativo:** Listagem dinâmica de produtos com suporte nativo a busca textual em tempo real, paginação indexada e filtros avançados por categoria.
- **Módulo de Detalhes:** Tela dedicada para exibição aprofundada de especificações de cada produto, galeria de imagens e avaliações técnica-comerciais.
- **Simulador de Carrinho:** Gerenciamento de estado global para adição, remoção, alteração de quantidade e cálculo automatizado de valores e totais de itens selecionados.

---

## Guia de Localização e Defesa Técnica de Requisitos

Abaixo está a documentação detalhada de como os requisitos técnicos solicitados foram implementados na arquitetura deste projeto.

### 1. Estrutura de Componentes e Tipagem com TypeScript

- **Nome do requisito:** Inicialização com Vite, Componentes Desacoplados, Props Estritas, Composição com Children e Estilos Modulares.
- **Onde encontrar:**
  - **Inicialização e Configurações:** Arquivos `package.json`, `tsconfig.json` e `vite.config.ts` na raiz do projeto.
  - **Composição e Tipagem Base:** Arquivo `src/App.tsx` e componente de layout em `src/components/layout/AppLayout.tsx`.
  - **Interfaces e Tipagem da API:** Arquivo `src/services/productService.ts` e definições em `src/types/product.ts`.
  - **Organização Modular de Estilos:** Arquivo `src/theme.ts` (integração do design global do Mantine UI) e folhas de estilo locais como `src/App.css`.

- **Explicação técnica:**
  - **Template React + TypeScript com Vite:** A fundação do ecossistema utiliza compilação baseada em tipos estritos e empacotamento rápido nativo do Vite, garantindo _Hot Module Replacement (HMR)_ estável e otimizado para o desenvolvimento.
  - **Componentes Desacoplados e Sem `any`:** Conforme observado no arquivo `AppLayout.tsx`, a interface `NavItemProps` define explicitamente propriedades tipadas como `to: string`, `label: string`, e `icon: React.ReactNode`. O uso do tipo genérico inseguro `any` foi 100% omitido, forçando o compilador do TypeScript a auditar todas as propriedades em tempo de desenvolvimento. O componente é estruturado de maneira puramente funcional utilizando o tipo `React.FC<NavItemProps>`.
  - **Composição com `children`:** No arquivo principal `App.tsx`, a arquitetura implementa o padrão de composição estrutural do React através do `MantineProvider` e do `<AuthProvider>`, que encapsulam as sub-rotas (`<AppRoutes />`) como elementos filhos (_children_), propagando estados contextuais de forma limpa, segura e modular.
  - **Estilos Modulares:** O projeto adota uma abordagem robusta de estilização ao centralizar a identidade visual e customização de componentes através do arquivo unificado `src/theme.ts`. Este é injetado globalmente pelo `<MantineProvider theme={theme}>`, evitando vazamento de escopo visual indesejado e combinando perfeitamente com regras de layout isoladas em arquivos como `src/App.css`.

### 2. Estado Reativo, Imutabilidade e Ciclo de Vida

- **Nome do requisito:** Gerenciamento de Estado com useState, Imutabilidade com Spread Operator, Sincronização Sutil com useEffect e Função de Limpeza (Cleanup).
- **Onde encontrar:**
  - **Ciclo de Vida, AbortController e Busca com Debounce:** Arquivo `src/pages/ProductsPage.tsx` (linhas 54 a 56 para estados locais; linhas 69 a 90 para o efeito assíncrono).
  - **Gerenciamento Global e Imutabilidade:** Arquivo `src/contexts/AuthContext.tsx` (linhas 87 a 121 na declaração do `AuthProvider` e manipulação de estado do carrinho/sessão).

- **Explicação técnica:**
  - **Estado Local Reativo e Imutabilidade:** No arquivo `ProductsPage.tsx`, o controle de reatividade para o catálogo usa estados atômicos isolados por meio de `useState`, como `const [products, setProducts] = useState<Product[]>([]);`. A imutabilidade é estritamente preservada ao atualizar estados complexos (como listas e objetos); estruturas pré-existentes não sofrem mutação direta, sendo recriadas na memória através do operador spread (`...`), conforme padronizado nas atualizações de estado estruturadas no `AuthContext.tsx`.
  - **Ciclo de Vida Preciso com `useEffect`:** Na `ProductsPage.tsx` (linha 69), o hook `useEffect` é empregado para sincronizar o componente com a API DummyJSON de forma cirúrgica. O array de dependências monitora variáveis dinâmicas de paginação, filtros de categoria e o valor de busca pós-_debounce_ (`debouncedSearch`), evitando ciclos infinitos de renderização ou requisições redundantes ao servidor.
  - **Implementação de Função de Limpeza (_Cleanup Function_):** Para mitigar vazamentos de memória (_memory leaks_) e condições de corrida (_race conditions_) decorrentes de requisições assíncronas concorrentes, o `useEffect` inicia uma instância de `AbortController`. Caso o usuário mude de página ou continue digitando na busca antes do término da requisição anterior, a função de limpeza retornada pelo efeito invoca imediatamente `controller.abort()`. O bloco `catch` intercepta esse sinal de forma segura (`if (err instanceof DOMException && err.name === 'AbortError') return;`), cancelando a operação de rede obsoleta instantaneamente.

### 3. Estado Global com Context API e Custom Hooks

- **Nome do requisito:** Compartilhamento de Estado Global, Providers de Contexto e Custom Hooks de Consumo Seguro.
- **Onde encontrar:**
  - **Criação e Provedor do Contexto:** Arquivo `src/contexts/AuthContext.tsx` (linhas 74 a 82 na criação do contexto; linhas 87 a 122 no empacotamento do `<AuthProvider />`).
  - **Abstração e Validação do Custom Hook:** Arquivo `src/hooks/useAuth.ts` (definição completa do hook customizado das linhas 17 a 27).
  - **Consumo Prático:** Arquivo `src/pages/ProductsPage.tsx` (linha 44) e no componente de rotas `src/components/layout/ProtectedRoute.tsx`.

- **Explicação técnica:**
  - **Context API para Dados Compartilhados:** O arquivo `AuthContext.tsx` centraliza os estados mais sensíveis e amplamente compartilhados da aplicação de e-commerce de forma global. Ele gerencia unificadamente a sessão de login do usuário (`user`), os tokens JWT (`token`), o status global de carregamento (`isLoading`) e todo o estado síncrono e persistido do **Carrinho de Compras** (`cart: CartItem[]`), incluindo métodos utilitários essenciais como `addToCart`, `removeFromCart` e `clearCart`. Esse contexto é injetado diretamente na raiz do ecossistema pelo `<AuthProvider />`, evitando a poluição e acoplamento por passagem manual de propriedades ao longo da árvore de renderização (_prop drilling_).
  - **Abstração por Custom Hook Dedicado (`useAuth`):** Em vez de expor o contexto diretamente aos componentes, a arquitetura isola a API nativa do React em um hook customizado exposto em `src/hooks/useAuth.ts`. O hook retorna o objeto encapsulado e devidamente tipado como `AuthContextType`, limpando o escopo visual das páginas que necessitam consumir as informações globais.
  - **Validação de Segurança em Tempo de Execução:** Conforme documentado no arquivo `useAuth.ts` (linhas 19 a 23), o hook realiza uma asserção lógica essencial: `if (!context) { throw new Error('[useAuth] O hook useAuth deve ser utilizado obrigatoriamente dentro de um <AuthProvider />'); }`. Essa cláusula de guarda atua como uma barreira de segurança de arquitetura, notificando imediatamente o desenvolvedor por meio de uma exceção explícita caso o hook seja invocado por um componente posicionado fora ou acima da árvore de escopo do _Provider_ correto.

### 4. Roteamento e Layouts com React Router

- **Nome do requisito:** Configuração de Rotas Declarativas, Layouts Aninhados Baseados em Outlet, Navegação Declarativa/Ativa, Navegação Programática e Captura de Parâmetros Dinâmicos.
- **Onde encontrar:**
  - **Configuração e Árvore de Rotas:** Arquivos `src/routes/index.tsx` (linhas 9 a 11) e `src/routes/router.tsx` (linhas 15 a 45).
  - **Layout Persistente e Menu de Navegação:** Arquivo `src/components/layout/AppLayout.tsx` (definição do link de navegação ativo nas linhas 51 a 67; renderização estrutural a partir da linha 89).
  - **Captura de ID Dinâmico:** Arquivo `src/pages/ProductDetailPage.tsx` (injeção e consumo do hook `useParams`).

- **Explicação técnica:**
  - **Rotas Declarativas e Arquitetura Centralizada:** O projeto adota a API moderna baseada em objetos do React Router por meio do método `createBrowserRouter` no arquivo `router.tsx`. O componente global `<AppRoutes />` injeta esse mapeamento de maneira declarativa utilizando o `<RouterProvider router={router} />`, desacoplando completamente a definição das rotas do fluxo principal de renderização.
  - **Layouts Persistentes e Renderização Aninhada (`<Outlet />`):** Conforme estruturado em `router.tsx` (linhas 15 a 19), a raiz do ecossistema possui uma rota pai configurada com o elemento `<AppLayout />`. Os componentes de página (`<HomePage />`, `<ProductsPage />`, etc.) são acoplados como propriedades dentro do array de `children`. O cabeçalho, a barra lateral e os elementos de menu permanecem persistentes na tela, enquanto a renderização das telas filhas ocorre dinamicamente por meio do componente `<Outlet />` posicionado no corpo do layout principal (dentro do componente estrutural `<AppShell>`).
  - **Navegação Declarativa com Indicação de Rota Ativa:** No arquivo `AppLayout.tsx` (linha 53), a barra lateral faz uso do componente customizado `<RouterNavLink>` (apelidado internamente para evitar conflitos de nomenclatura com o Mantine). O componente utiliza uma função de estilo dinâmica injetada na propriedade `style={({ isActive }) => ({ ... })}` (linhas 57 a 66), alterando a cor do texto para `#2a4d37` (tom da paleta nórdica) e aumentando o peso da fonte (`fontWeight: isActive ? 600 : 500`) em tempo real quando o caminho atual condiz com o link selecionado.
  - **Navegação Programática e Parâmetros Dinâmicos:** A transição imperativa entre telas (como redirecionar o usuário após o login) é gerenciada de forma segura através do hook `useNavigate()`. Para a visualização detalhada do catálogo, o arquivo `router.tsx` (linha 30) define a rota dinâmica com um parâmetro nomeado: `path: 'produtos/:id'`. O componente `<ProductDetailPage />` captura essa variável de forma transparente utilizando o hook nativo `useParams()`, permitindo realizar a busca reativa do produto específico na API DummyJSON sem poluir o estado global.

### 5. Interface Gráfica e Formulários com Mantine UI

- **Nome do requisito:** Configuração de Providers Globais, Criação de Layouts Responsivos, Formulação com @mantine/form, Listagens Avançadas com Paginação e Feedback Visual de Carregamento.
- **Onde encontrar:**
  - **Configuração de Tema:** Arquivos `src/App.tsx` (injeção do `<MantineProvider theme={theme}>`) e parametrizações em `src/theme.ts`.
  - **Estrutura de Componentes e Formulários:** Arquivo `src/pages/LoginPage.tsx` (instanciação do hook `useForm` e regras de validação das linhas 48 a 66; renderização do formulário desacoplado em `<form onSubmit={form.onSubmit(...)}>`).
  - **Layout Responsivo e Catálogo Dinâmico:** Arquivo `src/pages/ProductsPage.tsx` (configuração do grid adaptável nas linhas 269 e 304).
  - **Paginação Indexada:** Arquivo `src/pages/ProductsPage.tsx` (linhas 239 a 248).
  - **Feedback de Carregamento (Loading & Skeletons):** Arquivo `src/pages/ProductsPage.tsx` (renderização do bloco de esqueletos nas linhas 268 a 272 e do `<LoadingOverlay />` na linha 298).

- **Explicação técnica:**
  - **Arquitetura de Layouts Fluídos e Responsivos:** O projeto utiliza componentes primitivos de organização espacial do Mantine UI para estabelecer uma interface totalmente adaptável. Na listagem de produtos do arquivo `ProductsPage.tsx` (linhas 269 e 304), o componente `<SimpleGrid>` gerencia automaticamente a quebra de linhas do catálogo mapeado (`paginatedProducts.map`), sendo parametrizado dinamicamente para se adequar a múltiplos viewports por meio da propriedade `cols={{ base: 1, sm: 2, md: 3, lg: 4 }}`. Isso garante uma visualização em coluna única para smartphones e distribuição harmônica em quatro colunas para monitores desktop de alta resolução.
  - **Gerenciamento Avançado de Formulários com `@mantine/form`:** Conforme implementado nas linhas 48 a 66 do arquivo `LoginPage.tsx`, o estado de entrada de dados é gerenciado por meio do hook `useForm<LoginFormValues>`. O formulário opera de modo não controlado (`mode: 'uncontrolled'`), otimizando o ciclo de renderização do React. A conexão estrita e segura entre a estrutura lógica e os inputs visuais (`<TextInput>` e `<PasswordInput>`) ocorre de maneira declarativa através do spread de propriedades injetado por `...form.getInputProps('email')` e `...form.getInputProps('password')` (linhas 202 e 214).
  - **Cláusulas de Validação Estritas e Seguras:** O bloco `validate` intercepta o evento de submissão aplicando validações determinísticas com TypeScript. O campo de e-mail é validado através de uma expressão regular em `emailRegex.test(value.trim())`, enquanto o campo de senha intercepta valores nulos (`!value`). Caso alguma restrição falhe, o ecossistema bloqueia a requisição de rede assíncrona (`handleSubmit`) e renderiza os textos de erro locais de forma automática e integrada nos inputs correspondentes.
  - **Feedback Assíncrono com Skeletons e Overlays:** Para blindar a interface contra instabilidades de carregamento e prover uma experiência de usuário (UX) fluida durante a busca ou troca de paginação, o sistema monitora o estado de pendência de rede (`isLoading` / `loading`). Na `ProductsPage.tsx` (linha 268), enquanto a primeira requisição está ativa, a interface exibe uma simulação visual através de uma matriz estruturada com múltiplos componentes `<Skeleton height={400} radius="lg" />`. Durante transições internas (como troca de filtros por categoria), a tela aciona um `<LoadingOverlay visible={loading} />` (linha 298) parametrizado com uma animação personalizada de pontos (`loaderProps={{ color: 'forest', type: 'dots', size: 'md' }}`), prevenindo disparos de cliques duplicados acidentais.

### 6. Fluxo de Autenticação JWT e Rotas Protegidas

- **Nome do requisito:** Autenticação por Consumo de Endpoints da API, Persistência Local de Sessão (Tokens), Sincronização de Estado de Autenticação e Bloqueio Estrutural de Áreas Restritas.
- **Onde encontrar:**
  - **Configuração e Chaves de Armazenamento:** Arquivo `src/contexts/AuthContext.tsx` (Definição de chaves locais nas linhas 77 a 79).
  - **Resolução de Credenciais e Requisição POST:** Arquivo `src/contexts/AuthContext.tsx` (linhas 201 a 227 no fluxo de Login consumindo o Axios em `/auth/login`).
  - **Persistência e Efeito de Inicialização:** Arquivo `src/contexts/AuthContext.tsx` (linhas 283 a 298 no efeito de restauração de sessão).
  - **Componente de Bloqueio de Rotas:** Arquivo `src/components/layout/ProtectedRoute.tsx` (Lógica de guarda e redirecionamento de tela de ponta a ponta das linhas 23 a 62).

- **Explicação técnica:**
  - **Consumo do Endpoint de Autenticação JWT:** A validação de identidade ocorre de maneira assíncrona por meio do método `login` instanciado no `AuthContext.tsx` (linha 201). O sistema intercepta as credenciais informadas e, por meio de uma estratégia utilitária corporativa (`EMAIL_TO_USERNAME_MAP`), converte entradas de e-mail nos usernames padronizados exigidos pela API DummyJSON. A requisição é disparada de forma limpa via método `api.post('/auth/login', ...)` (linha 227), enviando os dados em formato JSON e capturando a resposta estritamente tipada com o objeto de sessão e tokens JWT do usuário.
  - **Persistência de Sessão no Navegador:** Ao receber o sinal de sucesso do servidor, o token de acesso (JWT) e os metadados do usuário autenticado são persistidos localmente nas camadas de armazenamento do navegador por meio dos métodos `localStorage.setItem` ou `sessionStorage.setItem`, vinculados através das constantes globais indexadas `USER_STORAGE_KEY` e `TOKEN_STORAGE_KEY` (linhas 77 e 78), mantendo o ecossistema resiliente a recarregamentos de página.
  - **Sincronização e Restauração de Estado Reativo:** Durante a montagem do provider, o ecossistema dispara um hook `useEffect` (linha 283) responsável por invocar o método assíncrono `restoreSession`. Essa rotina inspeciona os storages do navegador em busca de tokens salvos. Caso um token válido seja interceptado, a flag reativa global muda instantaneamente para `isAuthenticated: true` (linha 116), restabelecendo o fluxo operacional do usuário logado.
  - **Guarda de Rota de Alta Ordem e Bloqueio de Acesso:** O isolamento de áreas restritas (como o painel administrativo, carrinho de compras ou visualização de preços exclusivos de membros) é gerido de forma imperativa pelo componente funcional estruturado em `ProtectedRoute.tsx` (linha 23). O componente extrai o status de sessão do hook `useAuth()` e atua sob três pilares fundamentais de controle de fluxo de renderização:
    1. **Estado de Carregamento Pendente (Linhas 42 a 52):** Enquanto a validação de token do storage ou API está sendo executada (`if (isLoading)`), o componente bloqueia o acesso e exibe um feedback de carregamento centralizado (`<Loader size="lg" color="forest" type="dots" />`).
    2. **Redirecionamento Programático Defensivo (Linhas 31 a 38):** Se o carregamento terminar e o usuário não estiver autenticado (`!isLoading && !isAuthenticated`), um hook `useEffect` dispara a função `navigate(redirectTo, { replace: true })`. O sistema adiciona cirurgicamente a rota de origem (`state: { from: ... }`) no histórico do React Router, permitindo redirecionar o cliente de volta à página que ele tentava acessar logo após fazer o login com sucesso.
    3. **Renderização Condicional Segura (Linhas 55 a 61):** Enquanto o redirecionamento ocorre, a renderização física do conteúdo sensível é abortada retornando `null`. Caso o usuário possua autenticação confirmada, o componente libera a renderização dos componentes filhos diretos (`children`) ou o aninhamento via `<Outlet />`.

### 7. Consumo de API REST, Interceptors e Validação com Zod

- **Nome do requisito:** Centralização com Axios, Interceptors de Requisição/Resposta e Validação de Schemas com Zod.
- **Onde encontrar:**
  - **Instância do Axios e Interceptors:** `src/services/api.ts`
  - **Classe de Erro Customizada:** `src/services/api.ts` (`ApiError`)
  - **Schemas do Zod:** `src/schemas/productSchema.ts` e `src/schemas/authSchema.ts`
  - **Validação de Respostas:** `src/services/productService.ts` e `src/contexts/AuthContext.tsx`
  - **Formulário de Login com Validação:** `src/pages/LoginPage.tsx`

- **Explicação técnica:**
  - **Centralização do Axios:** Criada uma instância do Axios em `src/services/api.ts` com `baseURL: 'https://dummyjson.com'`, timeout e cabeçalhos padrão (`Accept` e `Content-Type` como `application/json`). O estado de carregamento (_Loading_) é gerenciado via loaders de UI, flags nos contextos/hooks e pelo `LoadingOverlay` do Mantine. Para o tratamento de erros, a classe `ApiError` normaliza os códigos HTTP e as respostas do servidor para mensagens amigáveis em português.
  - **Interceptors de Requisição e Resposta:** O interceptor de requisição verifica se há um token JWT no `localStorage` ou `sessionStorage` e injeta automaticamente o cabeçalho `Authorization: Bearer <token>`. O interceptor de resposta captura falhas de rede (`ECONNABORTED`, `ERR_NETWORK`), timeouts e status HTTP (erros 400, 401, 403, 404, 500, etc.). Caso retorne status 401 ou 403, ele limpa a sessão e emite um evento para logout global automático.
  - **Schemas Zod, Inferência e Mantine:** Os schemas para produtos, respostas paginadas, formulário de login e usuário foram definidos com `z.object` nos arquivos de schema. Os tipos do TypeScript (como `Product` e `LoginFormValues`) são derivados automaticamente via `z.infer`, evitando duplicar interfaces. As respostas da API são validadas de forma segura com `.safeParse()` dentro de `productService.ts` e `AuthContext.tsx`. Na camada visual, o formulário em `LoginPage.tsx` integra a validação do Zod ao Mantine Forms usando o `zodResolver`.

### 8. Testes Automatizados com Vitest e RTL

- **Nome do requisito:** Testes Unitários e de Componentes com Vitest, React Testing Library (RTL) e Otimizações de Performance.
- **Onde encontrar:**
  - **Suítes de Testes de Componentes:** `src/pages/NotFoundPage.test.tsx`, `src/pages/AboutPage.test.tsx` e `src/pages/LoginPage.test.tsx`
  - **Suítes de Rotas e Serviços:** `src/components/ProtectedRoute.test.tsx` e `src/services/api.test.ts`
  - **Utilitários Globais de Teste:** `src/test/test-utils.tsx`
  - **Configuração do Ambiente:** `vite.config.ts`

- **Explicação técnica:**
  - **Suíte de Testes Estruturada (23 testes passando):** Implementada a cobertura completa de fluxos críticos de UI, serviços e schemas através do Vitest e React Testing Library, resultando em 100% de aprovação nos 7 arquivos de testes do ecossistema.
  - **Consultas Acessíveis e Visão do Usuário:** Os testes de comportamento visual priorizam a perspectiva do usuário final utilizando queries baseadas em acessibilidade (`getByRole`, `getByText`), evitando depender de seletores de ID ou classes CSS internas do Mantine UI.
  - **Simulação de Interações Reais:** Interações de teclado e clique são executadas via `@testing-library/user-event`. O método `userEvent.setup()` é instanciado rigorosamente uma vez por teste de forma segura, acoplado ao utilitário customizado `renderWithProviders`.
  - **Isolamento de Dependências e Wrappers em Memória:** Para isolar o comportamento dos componentes sem poluir os testes com efeitos colaterais de rede, foi criada a flag `withAuth: false` em `LoginPage.test.tsx`. Isso desativa o wrapper `AuthProvider` real nos cenários onde o hook já está mockado, impedindo disparos desnecessários do endpoint `GET /auth/me`.
  - **Otimização de Performance e Keystrokes:** Sabendo que cada caractere digitado pelo `userEvent.type()` consome aproximadamente 25ms, foi adotada a estratégia de encurtar strings de teste de formulário (ex: usando `'abc'` em vez de strings longas). A técnica reduziu o tempo de execução do teste de digitação pela metade (-50%).
  - **Co-localização e Organização:** O projeto segue o padrão de manter os arquivos de testes colados aos seus respectivos componentes (`.test.tsx` para elementos visuais e `.test.ts` para arquivos lógicos/schemas).

### 9. Testes Ponta a Ponta com Playwright

- **Nome do requisito:** Testes de Navegador E2E Automatizados em Modo Headless e Localizadores Semânticos.
- **Onde encontrar:**
  - **Configuração Global do Framework:** Arquivo `playwright.config.ts` na raiz do projeto.
  - **Scripts de Auto:** `package.json` (`yarn test:e2e`, `yarn test:e2e:ui`, `yarn test:e2e:report`).
  - **Especificações de Fluxos E2E:** Arquivos `e2e/auth.spec.ts` e `e2e/catalog.spec.ts`.
  - **Isolamento de Escopo:** Modificaçõemaçãos de exclusão de diretório no arquivo `vite.config.ts`.

- **Explicação técnica:**
  - **Configuração do Playwright:** O framework está estruturado com a `baseURL: 'http://localhost:5173'`, configurado para execução em modo oculto (_headless_) por padrão e integrado diretamente ao servidor de desenvolvimento do Vite através do parâmetro `reuseExistingServer: true`. Os relatórios de execução geram saídas detalhadas tanto no terminal quanto em páginas HTML estáticas.
  - **Isolamento de Escopos de Teste:** O arquivo `vite.config.ts` foi estrategicamente ajustado com a inclusão de regras `exclude: ['e2e/**']` na suíte do Vitest. Isso garante a separação arquitetural absoluta entre os testes unitários/componentes e as rotas de simulação real do navegador.
  - **Fluxos Automatizados com Localizadores Semânticos:**
    - **Fluxo 1: Autenticação & Redirecionamento (`e2e/auth.spec.ts`):** Validação da acessibilidade da Home pública e do formulário via localizadores semânticos padrão (`getByRole`, `getByLabel`). Modela o fluxo de login usando credenciais reais da DummyJSON com redirecionamento automático para a rota protegida `/produtos`, preservando a rota de retorno, testando alertas para credenciais incorretas e garantindo a limpeza completa do estado local no encerramento da sessão (_logout_).
    - **Fluxo 2: Catálogo & Detalhes do Produto (`e2e/catalog.spec.ts`):** Cobertura do carregamento de cards de produtos do catálogo, filtros por categoria via `SegmentedControl`, busca em tempo real tratada com debounce, navegação direcionada para a página de detalhes dinâmica (`/produtos/:id`) e liberação de preços e gatilhos de CTA somente sob sessão autenticada.
    - **Fluxo 3: Sacola de Compras / Mini Cart (`e2e/catalog.spec.ts`):** Teste de ponta a ponta que valida a abertura e fechamento assíncrono do drawer lateral de compras sem recarregamento de página, fluxo completo de adição e atualização de itens no carrinho, exibição dinâmica da régua de frete grátis e validação do botão de checkout.
  - **Status e Métricas da Bateria de Testes:**
    - **Playwright E2E:** **15 testes aprovados** com sucesso (`15 passed`) em um tempo total de **51.8s** rodando via `yarn test:e2e`.
    - **Vitest Unitários/Componentes:** **23 testes aprovados** distribuídos em **7 arquivos** (`23 passed`), mantendo integridade total em co-existência com o ambiente Playwright.

### 10. Pipeline de CI/CD e Deploy em Produção

- **Nome do requisito:** Pipeline de CI/CD, Deploy Automatizado no GitHub Pages, Fallback de Rotas SPA e Proteção de Branch.
- **Onde encontrar:**
  - **Automação de CI:** Arquivo `.github/workflows/ci.yml`.
  - **Automação de CD:** Arquivo `.github/workflows/cd.yml`.
  - **Ajustes de Ambiente e Roteamento:** Arquivos `web-app-react/vite.config.ts` e `web-app-react/src/routes/router.tsx`.
  - **Fallback SPA:** Arquivos `web-app-react/public/404.html` e `web-app-react/index.html`.

- **Explicação técnica:**
  - **Pipeline de Integração Contínua (CI):** O fluxo configurado no arquivo `ci.yml` é disparado de forma automática a cada `push` e `pull_request` direcionados à branch `main`. O ecossistema utiliza isolamento através do `working-directory: web-app-react` e implementa o setup do **Node.js 24** com cache inteligente do gerenciador de pacotes Yarn. A integridade do ambiente é assegurada pela instalação de dependências com o comando estrito `yarn install --frozen-lockfile`. Na sequência, são validados os testes unitários e de integração via `Vitest` (`yarn test`), seguidos pelo provisionamento automatizado do ecossistema de navegadores Chromium do `Playwright` para a execução dos testes de ponta a ponta (`yarn test:e2e`).
  - **Pipeline de Entrega e Deploy Contínuo (CD):** O fluxo declarado no arquivo `cd.yml` é ativado em novos commits na branch `main` ou de forma manual através de `workflow_dispatch`. O fluxo possui controle estrito de concorrência (`group: pages` com `cancel-in-progress: true`) e opera com permissões elevadas de segurança (`pages: write`, `id-token: write`). Após a compilação do build de produção (`yarn build`), o ecossistema configura nativamente o ambiente via `actions/configure-pages@v5`, realiza o upload do artefato estático gerado na pasta `dist` com `actions/upload-pages-artifact@v3` e efetua a publicação oficial sem dependência de chaves de acesso externas usando `actions/deploy-pages@v4`.
  - **Configuração Dinâmica do Vite e Roteamento:** Para suportar os subcaminhos de repositórios do GitHub Pages sem engessar o código em caminhos estáticos, o arquivo `vite.config.ts` injeta dinamicamente a propriedade `base` analisando a variável global `process.env.GITHUB_REPOSITORY`. Em total harmonia, o mecanismo de navegação mapeia o `basename: import.meta.env.BASE_URL` dentro do método `createBrowserRouter`, garantindo que toda a árvore de navegação conheça e respeite o escopo e o prefixo correto da URL de hospedagem.
  - **Fallback de Rotas SPA (Single Page Application):** Como servidores de páginas estáticas desconhecem o histórico interno de rotas do React Router no lado do cliente, foi implementada uma engenharia de fallback. O arquivo `public/404.html` intercepta requisições diretas ou recarregamentos de página (F5) não encontrados e codifica de forma segura a URL em parâmetros de query string. No momento seguinte, um script receptor posicionado no `<head>` do `index.html` descriptografa a rota e manipula a API nativa do navegador através de `window.history.replaceState`, remontando os caminhos da aplicação (como `/produtos` ou `/produtos/:id`) de forma limpa, imperceptível e livre de erros visuais.

## 🚀 Como Executar o Projeto

Certifique-se de ter o [Node.js](https://nodejs.org) e o gerenciador de pacotes [Yarn](https://yarnpkg.com) instalados em sua máquina antes de iniciar.

### 1. Instalação de Dependências

Instale os pacotes do projeto e as dependências de navegadores do Playwright executando:

```bash
# Instalar dependências do projeto
yarn install

# Instalar os navegadores reais do Playwright (Chromium, Firefox, WebKit)
npx playwright install
```

### 2. Executando a Aplicação

Para iniciar o servidor de desenvolvimento local com o Vite:

```bash
yarn dev
```

A aplicação estará disponível no endereço padrão `http://localhost:5173`.

---

## 🧪 Instruções de Testes

O projeto conta com uma arquitetura híbrida de testes, dividida entre testes de unidade/componentes (Vitest) e testes ponta a ponta (Playwright).

### ⚡ Testes Unitários e de Componentes (Vitest + RTL)

Os testes rodam de forma otimizada reutilizando uma única instância do JSDOM para garantir o melhor desempenho.

```bash
# Executar a suíte de testes unitários uma única vez
yarn test

# Executar os testes em modo Watch (modo de observação para desenvolvimento)
yarn test:watch
```

### 🎭 Testes Ponta a Ponta (Playwright E2E)

Os testes de navegador simulam fluxos reais de usuário (Autenticação, Catálogo e Sacola de Compras) integrados de forma automatizada ao servidor local do Vite.

```bash
# Executar todos os testes E2E em segundo plano (modo Headless)
yarn test:e2e

# Abrir a interface visual interativa (UI Mode) para acompanhar a execução
yarn test:e2e:ui

# Abrir o relatório HTML detalhado após a execução dos testes
yarn test:e2e:report
```
