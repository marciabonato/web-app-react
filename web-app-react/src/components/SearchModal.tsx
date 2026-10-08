/**
 * src/components/SearchModal.tsx
 *
 * Modal de Busca Rápida / Spotlight no catálogo Nordic Nest.
 * Permite buscar peças instantaneamente a partir de qualquer página,
 * com filtros rápidos por categoria, debounce e visualização de resultados.
 */

import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  TextInput,
  Stack,
  Group,
  Text,
  Badge,
  Box,
  Image,
  Loader,
  ScrollArea,
  Button,
  UnstyledButton,
  Divider,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconSearch,
  IconX,
  IconArrowRight,
  IconSparkles,
  IconArmchair,
  IconLamp,
  IconMoodEmpty,
} from '@tabler/icons-react';
import type { Product } from '../types/product';
import { fetchHomeDesignProducts } from '../services/productService';
import { useAuth } from '../hooks/useAuth';

export interface SearchModalProps {
  opened: boolean;
  onClose: () => void;
}

const QUICK_CATEGORIES = [
  { label: 'Todos', value: 'all', icon: <IconSparkles size={14} /> },
  { label: 'Móveis & Armários', value: 'furniture', icon: <IconArmchair size={14} /> },
  { label: 'Decoração & Luz', value: 'home-decoration', icon: <IconLamp size={14} /> },
  { label: 'Tapetes & Almofadas', value: 'textiles', icon: <IconSparkles size={14} /> },
];

export const SearchModal: React.FC<SearchModalProps> = ({ opened, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [debouncedQuery] = useDebouncedValue(searchTerm, 250);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega produtos quando o modal abre ou a categoria muda
  useEffect(() => {
    if (!opened) return;

    const controller = new AbortController();
    async function loadCatalog(): Promise<void> {
      try {
        setLoading(true);
        const data = await fetchHomeDesignProducts(selectedCategory, controller.signal);
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Erro na busca do catálogo', err);
      } finally {
        setLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      controller.abort();
    };
  }, [opened, selectedCategory]);

  // Filtra pelo termo de busca digitado
  const filteredResults = React.useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return products.slice(0, 6); // exibe as primeiras 6 como sugestões
    return products.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      const matchCategory = p.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchTags || matchCategory;
    });
  }, [products, debouncedQuery]);

  const handleSelectProduct = (productId: number): void => {
    onClose();
    startTransition(() => {
      navigate(`/produtos/${productId}`);
    });
  };

  const handleViewAllInCatalog = (): void => {
    onClose();
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('categoria', selectedCategory);
    if (debouncedQuery.trim()) params.set('busca', debouncedQuery.trim());
    navigate(`/produtos?${params.toString()}`);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      radius="lg"
      padding="lg"
      withCloseButton={false}
      centered
      overlayProps={{
        backgroundOpacity: 0.45,
        blur: 5,
      }}
      styles={{
        content: {
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e8e3d8',
          overflow: 'hidden',
        },
      }}
    >
      <Stack gap="md">
        {/* Campo de Busca de Alto Destaque */}
        <Group justify="space-between" align="center">
          <Text size="xs" fw={700} c="#2d6a4f" style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Explorador Nórdico
          </Text>
          <UnstyledButton
            onClick={onClose}
            aria-label="Fechar busca"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              borderRadius: 6,
              color: '#6b5e4c',
            }}
          >
            <IconX size={18} />
          </UnstyledButton>
        </Group>

        <TextInput
          placeholder="Buscar por armário, mesa, sofá, luminária, tapete..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          leftSection={<IconSearch size={20} color="#2d6a4f" stroke={2} />}
          rightSection={
            loading ? (
              <Loader size="xs" color="forest" />
            ) : searchTerm ? (
              <UnstyledButton onClick={() => setSearchTerm('')} style={{ display: 'flex' }} aria-label="Limpar termo de busca">
                <IconX size={14} color="#8f816c" />
              </UnstyledButton>
            ) : null
          }
          size="md"
          radius="md"
          autoFocus
          styles={{
            input: {
              backgroundColor: '#faf9f6',
              borderColor: '#d8d0c0',
              fontWeight: 500,
            },
          }}
        />

        {/* Chips de Categoria Rápida */}
        <Group gap="xs" wrap="wrap">
          {QUICK_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.value;
            return (
              <Button
                key={cat.value}
                size="compact-xs"
                variant={active ? 'filled' : 'light'}
                color={active ? 'forest' : 'gray'}
                radius="xl"
                leftSection={cat.icon}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  backgroundColor: active ? '#2d6a4f' : '#f4efe6',
                  color: active ? '#ffffff' : '#5b5047',
                }}
              >
                {cat.label}
              </Button>
            );
          })}
        </Group>

        <Divider color="#f0ece3" />

        {/* Lista de Resultados */}
        <ScrollArea.Autosize mah={380} type="auto">
          {loading && products.length === 0 ? (
            <Box py={40} style={{ textAlign: 'center' }}>
              <Loader color="forest" type="dots" size="md" />
              <Text size="xs" c="#8f816c" mt="sm">
                Buscando peças autênticas...
              </Text>
            </Box>
          ) : filteredResults.length === 0 ? (
            <Box py={36} style={{ textAlign: 'center' }}>
              <IconMoodEmpty size={36} color="#8f816c" stroke={1.5} />
              <Text size="sm" fw={600} c="#15120e" mt="xs">
                Nenhuma peça encontrada para &quot;{debouncedQuery}&quot;
              </Text>
              <Text size="xs" c="#6b5e4c" mt={4}>
                Tente buscar termos gerais como &quot;móveis&quot;, &quot;tapete&quot; ou &quot;iluminação&quot;.
              </Text>
            </Box>
          ) : (
            <Stack gap={8}>
              <Text size="11px" fw={700} c="#8f816c" style={{ textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {debouncedQuery ? `Resultados (${filteredResults.length})` : 'Sugestões em Destaque'}
              </Text>

              {filteredResults.map((product) => (
                <UnstyledButton
                  key={product.id}
                  onClick={() => handleSelectProduct(product.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    backgroundColor: '#faf9f6',
                    border: '1px solid #f0ece3',
                    transition: 'all 160ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1ece0';
                    e.currentTarget.style.borderColor = '#d8d0c0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#faf9f6';
                    e.currentTarget.style.borderColor = '#f0ece3';
                  }}
                >
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8e3d8',
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        w={48}
                        h={48}
                        fit="cover"
                        fallbackSrc="https://placehold.co/48x48?text=Nordic"
                      />
                    </Box>

                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Text size="xs" fw={700} c="#15120e" lineClamp={1}>
                        {product.title}
                      </Text>
                      <Group gap={6} mt={2}>
                        <Badge size="xs" variant="light" color="forest">
                          {product.category}
                        </Badge>
                        <Text size="10px" c="#6b5e4c">
                          ★ {(product.rating ?? 4.8).toFixed(1)}
                        </Text>
                      </Group>
                    </Box>
                  </Group>

                  <Group gap="xs" wrap="nowrap">
                    {isAuthenticated ? (
                      <Text size="sm" fw={700} c="#143323">
                        ${(product.price ?? 0).toFixed(2)}
                      </Text>
                    ) : (
                      <Text size="11px" fw={600} c="#cb4b20">
                        Preço sob login
                      </Text>
                    )}
                    <IconArrowRight size={16} color="#447c59" />
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>

        {/* Rodapé do Modal */}
        <Group justify="space-between" align="center" pt="xs" style={{ borderTop: '1px solid #f0ece3' }}>
          <Text size="xs" c="#8f816c">
            Pressione <kbd style={{ padding: '2px 6px', background: '#f4efe6', borderRadius: 4 }}>ESC</kbd> para fechar
          </Text>
          <Button
            size="xs"
            color="forest"
            variant="light"
            rightSection={<IconArrowRight size={14} />}
            onClick={handleViewAllInCatalog}
            style={{ fontWeight: 600 }}
          >
            Ver no Catálogo
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
