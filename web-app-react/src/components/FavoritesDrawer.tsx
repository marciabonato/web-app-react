/**
 * src/components/FavoritesDrawer.tsx
 *
 * Gaveta lateral deslizante para gerenciar a Lista de Desejos / Peças Favoritas.
 * Permite visualizar itens favoritados, transferi-los para a sacola de compras
 * e removê-los com feedback instantâneo.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Stack,
  Group,
  Text,
  Title,
  Box,
  ActionIcon,
  Button,
  Image,
  Badge,
  ScrollArea,
  Tooltip,
} from '@mantine/core';
import {
  IconHeart,
  IconHeartFilled,
  IconTrash,
  IconShoppingBag,
  IconArrowRight,
  IconX,
  IconShoppingCartPlus,
} from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types/product';

export interface FavoritesDrawerProps {
  opened: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  opened,
  onClose,
  onOpenCart,
}) => {
  const navigate = useNavigate();
  const {
    favorites,
    favoritesCount,
    removeFromFavorites,
    clearFavorites,
    addToCart,
    isAuthenticated,
  } = useAuth();

  const handleNavigateToProduct = (productId: number): void => {
    onClose();
    navigate(`/produtos/${productId}`);
  };

  const handleAddToCartFromFavorites = (product: Product): void => {
    addToCart(product, 1);
    if (onOpenCart) {
      onClose();
      onOpenCart();
    }
  };

  const handleExploreCatalog = (): void => {
    onClose();
    navigate('/produtos');
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.4,
        blur: 4,
      }}
      styles={{
        content: {
          backgroundColor: '#faf9f6',
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        },
      }}
    >
      {/* Cabeçalho da Gaveta de Favoritos */}
      <Box
        p="lg"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e8e3d8',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#fbeee8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cb4b20',
              }}
            >
              <IconHeartFilled size={20} />
            </Box>
            <Box>
              <Group gap={6} align="center">
                <Title order={3} style={{ fontSize: '1.2rem', color: '#15120e', fontWeight: 800 }}>
                  Peças Salvas
                </Title>
                {favoritesCount > 0 && (
                  <Badge color="terracotta" variant="filled" size="sm">
                    {favoritesCount}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="#6b5e4c">
                Sua curadoria pessoal de design escandinavo
              </Text>
            </Box>
          </Group>

          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            radius="md"
            aria-label="Fechar lista de favoritos"
            onClick={onClose}
          >
            <IconX size={20} color="#483e32" />
          </ActionIcon>
        </Group>
      </Box>

      {/* Conteúdo: Lista ou Estado Vazio */}
      {favorites.length === 0 ? (
        <Box
          p="xl"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#fbeee8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cb4b20',
              marginBottom: 16,
            }}
          >
            <IconHeart size={40} stroke={1.5} />
          </Box>

          <Title order={4} c="#15120e" mb={4}>
            Sua lista de desejos está vazia
          </Title>
          <Text size="sm" c="#6b5e4c" style={{ maxWidth: 280, lineHeight: 1.5 }} mb="lg">
            Salve suas peças preferidas clicando no coração dos produtos para acessá-las com facilidade.
          </Text>

          <Button
            variant="filled"
            color="forest"
            size="md"
            radius="md"
            rightSection={<IconArrowRight size={16} />}
            onClick={handleExploreCatalog}
            style={{ backgroundColor: '#2d6a4f', fontWeight: 700 }}
          >
            Explorar Catálogo
          </Button>
        </Box>
      ) : (
        <>
          <ScrollArea style={{ flex: 1 }} p="lg">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="#8f816c" style={{ textTransform: 'uppercase' }}>
                  {favoritesCount} {favoritesCount === 1 ? 'item salvo' : 'itens salvos'}
                </Text>
                <Button
                  variant="subtle"
                  color="red"
                  size="compact-xs"
                  onClick={clearFavorites}
                  leftSection={<IconTrash size={12} />}
                >
                  Limpar lista
                </Button>
              </Group>

              {favorites.map((product) => (
                <Box
                  key={product.id}
                  p="md"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e8e3d8',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <Group align="flex-start" gap="md" wrap="nowrap">
                    {/* Imagem clicável */}
                    <Box
                      onClick={() => handleNavigateToProduct(product.id)}
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #e8e3d8',
                        backgroundColor: '#faf9f6',
                        cursor: 'pointer',
                      }}
                    >
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        w={76}
                        h={76}
                        fit="cover"
                        fallbackSrc="https://placehold.co/76x76?text=Nordic"
                      />
                    </Box>

                    {/* Informações */}
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        size="sm"
                        fw={700}
                        c="#15120e"
                        lineClamp={1}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleNavigateToProduct(product.id)}
                      >
                        {product.title}
                      </Text>

                      <Group gap={6}>
                        <Badge size="xs" variant="light" color="forest">
                          {product.category}
                        </Badge>
                        <Text size="10px" c="#6b5e4c">
                          ★ {(product.rating ?? 4.8).toFixed(1)}
                        </Text>
                      </Group>

                      {isAuthenticated ? (
                        <Text size="sm" fw={800} c="#143323" mt={2}>
                          ${(product.price ?? 0).toFixed(2)}
                        </Text>
                      ) : (
                        <Text size="xs" fw={600} c="#cb4b20" mt={2}>
                          Preço sob login
                        </Text>
                      )}

                      {/* Ações */}
                      <Group gap="xs" mt="xs" wrap="wrap">
                        {isAuthenticated && (
                          <Button
                            size="compact-xs"
                            color="forest"
                            variant="filled"
                            leftSection={<IconShoppingCartPlus size={14} />}
                            onClick={() => handleAddToCartFromFavorites(product)}
                            style={{ backgroundColor: '#2d6a4f', fontWeight: 600 }}
                          >
                            Mover p/ Sacola
                          </Button>
                        )}
                        <Button
                          size="compact-xs"
                          variant="light"
                          color="gray"
                          onClick={() => handleNavigateToProduct(product.id)}
                        >
                          Ver Detalhes
                        </Button>
                        <Tooltip label="Remover dos favoritos" position="top">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            aria-label={`Remover ${product.title} dos favoritos`}
                            onClick={() => removeFromFavorites(product.id)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Stack>
                  </Group>
                </Box>
              ))}
            </Stack>
          </ScrollArea>

          {/* Rodapé da Gaveta */}
          <Box
            p="md"
            style={{
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e8e3d8',
            }}
          >
            <Button
              fullWidth
              variant="light"
              color="forest"
              size="md"
              radius="md"
              onClick={handleExploreCatalog}
              leftSection={<IconShoppingBag size={18} />}
            >
              Continuar Navegando
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};
