import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Group,
  Stack,
  Box,
  Skeleton,
  SegmentedControl,
  TextInput,
  Alert,
  Button,
  Pagination,
  LoadingOverlay,
  Select,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconSearch,
  IconAlertCircle,
  IconArrowRight,
  IconSparkles,
  IconLock,
  IconHeart,
  IconHeartFilled,
} from '@tabler/icons-react';
import type { Product } from '../types/product';
import { fetchHomeDesignProducts } from '../services/productService';
import { useAuth } from '../hooks/useAuth';

const CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Móveis & Armários',
  'home-decoration': 'Decoração & Design',
  textiles: 'Tapetes & Almofadas',
};

const PAGE_SIZE_OPTIONS = ['4', '8', '12', '16'];
const DEFAULT_PAGE_SIZE = 8;

interface FilterFormValues {
  search: string;
}

export const ProductsPage: React.FC = () => {
  const { isAuthenticated, toggleFavorite, isFavorite } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const activeCategoryParam = searchParams.get('categoria') ?? 'all';
  const pageFromQuery = parseInt(searchParams.get('pagina') || '1', 10);
  const currentPage = isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : pageFromQuery;
  const pageSizeParam = parseInt(searchParams.get('por_pagina') || String(DEFAULT_PAGE_SIZE), 10);
  const itemsPerPage = PAGE_SIZE_OPTIONS.includes(String(pageSizeParam)) ? pageSizeParam : DEFAULT_PAGE_SIZE;

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const catalogHeaderRef = useRef<HTMLDivElement>(null);

  // Formulário de busca gerenciado por @mantine/form
  const searchForm = useForm<FilterFormValues>({
    mode: 'uncontrolled',
    initialValues: { search: '' },
  });

  const searchValue = searchForm.getValues().search;
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts(): Promise<void> {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHomeDesignProducts(activeCategoryParam, controller.signal);
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro inesperado ao consultar o catálogo de design.');
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
    return () => { controller.abort(); };
  }, [activeCategoryParam]);

  const handleCategoryChange = (val: string): void => {
    const updated = new URLSearchParams(searchParams);
    updated.delete('pagina');
    if (val === 'all') {
      updated.delete('categoria');
    } else {
      updated.set('categoria', val);
    }
    setSearchParams(updated);
  };

  const handlePageSizeChange = (val: string | null): void => {
    if (!val) return;
    const updated = new URLSearchParams(searchParams);
    updated.delete('pagina');
    if (val === String(DEFAULT_PAGE_SIZE)) {
      updated.delete('por_pagina');
    } else {
      updated.set('por_pagina', val);
    }
    setSearchParams(updated);
  };

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    if (!query) return products;
    return products.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(query)) ?? false;
      return matchTitle || matchDesc || matchTags;
    });
  }, [products, debouncedSearch]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, safeCurrentPage, itemsPerPage]);

  const handlePageChange = (page: number): void => {
    const updated = new URLSearchParams(searchParams);
    if (page === 1) {
      updated.delete('pagina');
    } else {
      updated.set('pagina', String(page));
    }
    setSearchParams(updated);
    catalogHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const startCount = filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endCount = Math.min(safeCurrentPage * itemsPerPage, filteredProducts.length);

  return (
    <Container size="xl" py="md" ref={catalogHeaderRef}>
      {/* Cabeçalho da Seção de Produtos */}
      <Stack gap="xs" mb="xl">
        <Group gap="xs">
          <Badge color="forest" variant="filled" size="sm" leftSection={<IconSparkles size={12} />}>
            Curadoria Escandinava
          </Badge>
          <Text size="xs" fw={600} c="#483e32">
            Design atemporal, texturas puras e marcenaria de autor
          </Text>
        </Group>

        <Title
          order={1}
          style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
            letterSpacing: '-0.8px',
            color: '#15120e',
            fontWeight: 800,
          }}
        >
          Catálogo Nórdico: Mobiliário, Decoração & Têxteis
        </Title>
        <Text size="sm" c="#483e32" style={{ maxWidth: 760, lineHeight: 1.6 }}>
          Explore nossa seleção rigorosa de peças para o lar. Cada fotografia corresponde exatamente
          ao produto autêntico — de armários buffet em carvalho maciço e luminárias a tapetes
          de pura lã e almofadas em linho cru.
        </Text>
      </Stack>

      {/* Barra de Filtros e Busca — Responsiva */}
      <Card
        p="md"
        radius="md"
        withBorder
        mb="xl"
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#d8d0c0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Stack gap="sm">
          {/* Filtro de categoria — scroll horizontal em mobile */}
          <Box style={{ overflowX: 'auto' }}>
            <SegmentedControl
              value={activeCategoryParam}
              onChange={handleCategoryChange}
              data={[
                { label: 'Todos', value: 'all' },
                { label: 'Móveis & Armários', value: 'furniture' },
                { label: 'Decoração & Luz', value: 'home-decoration' },
                { label: 'Tapetes & Almofadas', value: 'textiles' },
              ]}
              color="forest"
              radius="md"
              style={{ fontWeight: 600, whiteSpace: 'nowrap' }}
              fullWidth
            />
          </Box>

          {/* Linha de busca + itens por página */}
          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder="Buscar por armário, tapete, almofada..."
              leftSection={<IconSearch size={16} stroke={1.8} />}
              radius="md"
              style={{ flex: 1, minWidth: 220 }}
              key={searchForm.key('search')}
              {...searchForm.getInputProps('search')}
            />
            <Select
              label=""
              placeholder="Itens/página"
              data={PAGE_SIZE_OPTIONS.map((v) => ({ value: v, label: `${v} por página` }))}
              value={String(itemsPerPage)}
              onChange={handlePageSizeChange}
              radius="md"
              w={150}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
          </Group>
        </Stack>
      </Card>

      {/* Indicador de Quantidade e Paginação */}
      {!loading && filteredProducts.length > 0 && (
        <Group justify="space-between" align="center" mb="md">
          <Text size="xs" fw={600} c="#6b5e4c">
            Exibindo <strong style={{ color: '#15120e' }}>{startCount}–{endCount}</strong> de{' '}
            <strong style={{ color: '#15120e' }}>{filteredProducts.length}</strong> peças selecionadas
          </Text>
          {totalPages > 1 && (
            <Text size="xs" c="#8f816c">
              Página {safeCurrentPage} de {totalPages}
            </Text>
          )}
        </Group>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Aviso"
          color="red"
          radius="md"
          mb="lg"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Grid de Produtos com LoadingOverlay */}
      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <Skeleton key={i} height={400} radius="lg" />
          ))}
        </SimpleGrid>
      ) : filteredProducts.length === 0 ? (
        <Card p={60} radius="lg" withBorder style={{ textAlign: 'center', backgroundColor: '#fcfbf9' }}>
          <Text size="lg" fw={700} c="#15120e">
            Nenhuma peça encontrada
          </Text>
          <Text size="sm" c="#6b5e4c" mt="xs">
            Tente buscar termos como &quot;armário&quot;, &quot;tapete&quot;, &quot;almofada&quot; ou limpe o campo de busca.
          </Text>
          <Button
            mt="md"
            variant="filled"
            color="forest"
            onClick={() => {
              searchForm.reset();
              handleCategoryChange('all');
            }}
          >
            Ver Todas as Peças
          </Button>
        </Card>
      ) : (
        <>
          {/* Container com overlay de loading durante troca de categoria */}
          <Box pos="relative">
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2, backgroundOpacity: 0.35 }}
              loaderProps={{ color: 'forest', type: 'dots', size: 'md' }}
            />

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
              {paginatedProducts.map((product) => (
                <Card
                  key={product.id}
                  component={Link}
                  to={`/produtos/${product.id}`}
                  state={{ from: `${location.pathname}${location.search}` }}
                  padding="md"
                  radius="lg"
                  withBorder
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#ffffff',
                    borderColor: '#d8d0c0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
                    transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                >
                  <Box>
                    {/* Imagem do Produto */}
                    <Card.Section
                      p="xs"
                      style={{
                        backgroundColor: '#f6f4ee',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '12px 12px 0 0',
                      }}
                    >
                      <Image
                        src={product.thumbnail}
                        height={220}
                        fit="cover"
                        alt={product.title}
                        fallbackSrc="https://placehold.co/400x300?text=Design+Nordico"
                        style={{
                          borderRadius: '8px',
                          transition: 'transform 350ms ease',
                        }}
                      />
                      <Tooltip label={isFavorite(product.id) ? 'Remover dos favoritos' : 'Favoritar peça'} position="right">
                        <ActionIcon
                          variant={isFavorite(product.id) ? 'filled' : 'light'}
                          color={isFavorite(product.id) ? 'terracotta' : 'gray'}
                          size="sm"
                          radius="xl"
                          aria-label={isFavorite(product.id) ? `Remover ${product.title} dos favoritos` : `Favoritar ${product.title}`}
                          style={{
                            position: 'absolute',
                            top: 14,
                            left: 14,
                            zIndex: 2,
                            backgroundColor: isFavorite(product.id) ? '#cb4b20' : 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product);
                          }}
                        >
                          {isFavorite(product.id) ? (
                            <IconHeartFilled size={14} color="#ffffff" />
                          ) : (
                            <IconHeart size={14} color="#5b5047" />
                          )}
                        </ActionIcon>
                      </Tooltip>
                      {product.discountPercentage > 0 && (
                        <Badge
                          color="terracotta"
                          variant="filled"
                          size="sm"
                          style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            boxShadow: '0 2px 6px rgba(203, 75, 32, 0.3)',
                            fontWeight: 700,
                          }}
                        >
                          -{Math.round(product.discountPercentage)}%
                        </Badge>
                      )}
                    </Card.Section>

                    {/* Categoria e Avaliação */}
                    <Group justify="space-between" mt="md" mb="xs">
                      <Badge color="forest" variant="light" size="xs">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </Badge>
                      <Text size="xs" fw={700} c="#2d6a4f">
                        ★ {(product.rating ?? 4.8).toFixed(1)}
                      </Text>
                    </Group>

                    {/* Título */}
                    <Text
                      fw={700}
                      size="md"
                      c="#15120e"
                      lineClamp={1}
                      style={{ letterSpacing: '-0.3px', lineHeight: 1.3 }}
                    >
                      {product.title}
                    </Text>

                    {/* Descrição */}
                    <Text size="xs" c="#483e32" lineClamp={2} mt={6} style={{ lineHeight: 1.5 }}>
                      {product.description}
                    </Text>
                  </Box>

                  {/* Preço e Botão */}
                  <Group
                    justify="space-between"
                    align="center"
                    mt="md"
                    pt="sm"
                    style={{ borderTop: '1px solid #e9e4d8' }}
                  >
                    {isAuthenticated ? (
                      <Box>
                        <Text size="11px" fw={600} c="#8f816c" style={{ textTransform: 'uppercase' }}>
                          Valor
                        </Text>
                        <Text fw={800} size="1.2rem" c="#143323">
                          ${(product.price ?? 0).toFixed(2)}
                        </Text>
                      </Box>
                    ) : (
                      <Box>
                        <Group gap={4} align="center">
                          <IconLock size={12} color="#cb4b20" />
                          <Text size="11px" fw={700} c="#cb4b20" style={{ textTransform: 'uppercase' }}>
                            Membros
                          </Text>
                        </Group>
                        <Text fw={700} size="12px" c="#6b5e4c">
                          Preço sob login
                        </Text>
                      </Box>
                    )}

                    <Button
                      size="xs"
                      color="forest"
                      variant="filled"
                      rightSection={<IconArrowRight size={14} />}
                      style={{
                        backgroundColor: '#2d6a4f',
                        transition: 'all 180ms ease',
                        pointerEvents: 'none',
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Paginação */}
          {totalPages > 1 && (
            <Box mt={48} mb={24}>
              <Stack align="center" gap="sm">
                <Pagination
                  total={totalPages}
                  value={safeCurrentPage}
                  onChange={handlePageChange}
                  color="forest"
                  radius="md"
                  size="md"
                  withEdges
                />
                <Text size="xs" c="#6b5e4c">
                  Mostrando página {safeCurrentPage} de {totalPages} ({filteredProducts.length} itens no total)
                </Text>
              </Stack>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
