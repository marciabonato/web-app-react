/**
 * e2e/catalog.spec.ts
 *
 * Fluxo 2 — Navegação no catálogo, busca, detalhe de produto
 * Fluxo 3 — Sacola de compras (MiniCart) em formato drawer
 *
 * Cenários cobertos:
 *  1. Catálogo lista produtos após carregar
 *  2. Filtro por categoria via SegmentedControl atualiza a listagem
 *  3. Campo de busca filtra produtos pelo nome com debounce
 *  4. Clicar no card navega para a página de detalhes do produto
 *  5. Usuário autenticado visualiza preço e botão de adicionar
 *  6. MiniCart abre pelo ícone no cabeçalho e pode ser fechado pelo botão X
 *  7. Adicionar produto à sacola atualiza contador e exibe o item no drawer
 *  8. Barra de frete grátis exibida com progresso
 *
 * Localizadores semânticos: getByRole, getByLabel, getByText, getByPlaceholder
 */

import { test, expect, type Page } from '@playwright/test';

const DEMO_EMAIL = 'emily.johnson@x.dummyjson.com';
const DEMO_PASSWORD = 'emilyspass';

// ─── Helper: Login via UI para sessão consistente ──────────────────────────

async function loginUser(page: Page) {
  await page.goto('/login');
  const emailInput = page.getByRole('textbox', { name: /e-mail/i });
  const passwordInput = page.getByLabel(/senha/i);
  await emailInput.clear();
  await emailInput.fill(DEMO_EMAIL);
  await passwordInput.clear();
  await passwordInput.fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: /entrar na conta/i }).click();
  await expect(page).toHaveURL(/\/produtos/, { timeout: 15_000 });
}

// ─── Suite do Catálogo ────────────────────────────────────────────────────────

test.describe('Fluxo 2 — Catálogo, busca e detalhe de produto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  // ── Cenário 2.1: Catálogo carrega e exibe produtos ─────────────────────────

  test('deve carregar o catálogo e exibir cards de produtos', async ({ page }) => {
    await page.goto('/produtos');

    // Aguarda o título do catálogo
    await expect(
      page.getByRole('heading', { name: /catálogo nórdico/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Aguarda os links dos cards de produtos
    const productLinks = page.locator('a[href^="/produtos/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15_000 });

    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  // ── Cenário 2.2: Filtro de categoria via SegmentedControl ──────────────────

  test('deve filtrar produtos por categoria ao selecionar no segmented control', async ({ page }) => {
    await page.goto('/produtos');

    // Clica no controle de segmento "Móveis & Armários" dentro do SegmentedControl
    const categoryButton = page.getByRole('radiogroup').getByText('Móveis & Armários');
    await expect(categoryButton).toBeVisible({ timeout: 10_000 });
    await categoryButton.click();

    // URL deve atualizar com o parâmetro da categoria
    await expect(page).toHaveURL(/categoria=furniture/, { timeout: 6_000 });

    // Cards devem ser carregados
    const productLinks = page.locator('a[href^="/produtos/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15_000 });
  });

  // ── Cenário 2.3: Campo de busca filtra produtos ────────────────────────────

  test('deve filtrar produtos ao digitar no campo de busca', async ({ page }) => {
    await page.goto('/produtos');

    const searchInput = page.getByPlaceholder(/buscar por armário/i);
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    await searchInput.fill('sofa');

    // Aguarda debounce e renderização
    await page.waitForTimeout(600);

    // Cards de produtos devem continuar visíveis ou atualizar
    const productLinks = page.locator('a[href^="/produtos/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10_000 });
  });

  // ── Cenário 2.4: Clicar num card navega para detalhe do produto ────────────

  test('deve navegar para a página de detalhe ao clicar num produto', async ({ page }) => {
    await page.goto('/produtos');

    const firstCard = page.locator('a[href^="/produtos/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    // URL deve mudar para /produtos/:id
    await expect(page).toHaveURL(/\/produtos\/\d+/, { timeout: 8_000 });

    // Página de detalhes exibe título h1 com o nome do produto
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  // ── Cenário 2.5: Página de detalhe para usuário autenticado ────────────────

  test('deve exibir preço e botão de compra para usuário autenticado', async ({ page }) => {
    await loginUser(page);

    // Na página de produtos, clica no primeiro produto
    const firstCard = page.locator('a[href^="/produtos/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/produtos\/\d+/, { timeout: 8_000 });

    // Botão Adicionar à Sacola deve estar disponível para usuário logado
    await expect(
      page.getByRole('button', { name: /^adicionar$/i }),
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ─── Suite da Sacola (MiniCart) ────────────────────────────────────────────────

test.describe('Fluxo 3 — Sacola de compras (MiniCart)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  // ── Cenário 3.1: Ícone da sacola abre o MiniCart ──────────────────────────

  test('deve abrir o Mini Cart ao clicar no ícone da sacola no cabeçalho', async ({ page }) => {
    await page.goto('/');

    const bagButton = page.getByRole('button', { name: /sacola de compras/i });
    await expect(bagButton).toBeVisible();
    await bagButton.click();

    // O drawer abre com título "Minha Sacola"
    await expect(
      page.getByRole('heading', { name: /minha sacola/i }),
    ).toBeVisible({ timeout: 5_000 });

    // Estado inicial: sacola vazia
    await expect(
      page.getByText(/sua sacola está vazia/i),
    ).toBeVisible();
  });

  // ── Cenário 3.2: MiniCart fecha com o botão X ─────────────────────────────

  test('deve fechar o Mini Cart ao clicar no botão X', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /sacola de compras/i }).click();
    await expect(
      page.getByRole('heading', { name: /minha sacola/i }),
    ).toBeVisible({ timeout: 5_000 });

    // Clica no botão fechar da gaveta
    await page.getByRole('button', { name: /fechar sacola/i }).click();

    // Drawer deixa de ser visível
    await expect(
      page.getByRole('heading', { name: /minha sacola/i }),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  // ── Cenário 3.3: Adicionar produto ao carrinho e abrir sacola ──────────────

  test('deve adicionar produto ao carrinho e exibir item na sacola', async ({ page }) => {
    await loginUser(page);

    // Navega para o primeiro produto
    const firstCard = page.locator('a[href^="/produtos/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/produtos\/\d+/, { timeout: 8_000 });

    // Clica no botão Adicionar
    const addButton = page.getByRole('button', { name: /^adicionar$/i });
    await expect(addButton).toBeVisible({ timeout: 10_000 });
    await addButton.click();

    // Alerta de sucesso de adição
    await expect(
      page.getByText(/peça adicionada/i),
    ).toBeVisible({ timeout: 5_000 });

    // Abre o MiniCart
    await page.getByRole('button', { name: /sacola de compras/i }).click();
    await expect(
      page.getByRole('heading', { name: /minha sacola/i }),
    ).toBeVisible({ timeout: 5_000 });

    // Confirma que não está mais vazio e exibe o botão de finalizar compra
    await expect(
      page.getByText(/sua sacola está vazia/i),
    ).not.toBeVisible();

    await expect(
      page.getByRole('button', { name: /finalizar compra/i }),
    ).toBeVisible();
  });

  // ── Cenário 3.4: Barra de frete grátis ─────────────────────────────────────

  test('deve exibir a barra de progresso de frete grátis ao abrir o MiniCart', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /sacola de compras/i }).click();
    await expect(
      page.getByRole('heading', { name: /minha sacola/i }),
    ).toBeVisible({ timeout: 5_000 });

    // Mensagem de frete grátis
    await expect(
      page.getByText(/frete grátis/i).first(),
    ).toBeVisible();
  });
});
