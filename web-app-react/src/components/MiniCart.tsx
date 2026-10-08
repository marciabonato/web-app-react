/**
 * src/components/MiniCart.tsx
 *
 * Gaveta de Mini Carrinho (Sacola) deslizante para Nordic Nest.
 * Abre como overlay lateral sem redirecionar o utilizador.
 * Funcionalidades:
 *  - Listagem de itens com thumbnail, nome e preço unitário
 *  - Controles de quantidade (+/-) com atualização reativa do subtotal
 *  - Confirmação antes de remover item ao zerar quantidade
 *  - Barra de progresso de frete grátis (meta: R$ 1.000)
 *  - CTA fixo "Finalizar Compra" no rodapé
 */

import React, { useState } from 'react';
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
  Divider,
  Progress,
  ScrollArea,
  ThemeIcon,
  Modal,
  Center,
} from '@mantine/core';
import {
  IconShoppingBag,
  IconTrash,
  IconPlus,
  IconMinus,
  IconTruckDelivery,
  IconPackageOff,
  IconCheck,
  IconArrowRight,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import type { CartItem } from '../contexts/AuthContext';

// ─── Constantes ────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 1000; // R$ 1.000,00

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

// ─── Sub-componente: linha de item do carrinho ─────────────────────────────────

interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <Box
      style={{
        padding: '14px 0',
        borderBottom: '1px solid #f0ece3',
        transition: 'background 180ms ease',
      }}
    >
      <Group align="flex-start" gap="md" wrap="nowrap">
        {/* Thumbnail */}
        <Box
          style={{
            width: 76,
            height: 76,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid #e8e3d8',
            backgroundColor: '#faf9f6',
          }}
        >
          <Image
            src={product.thumbnail}
            alt={product.title}
            w={76}
            h={76}
            fit="cover"
            fallbackSrc="https://placehold.co/76x76?text=NaN"
          />
        </Box>

        {/* Info + controles */}
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="sm"
            fw={600}
            c="#15120e"
            lineClamp={2}
            style={{ lineHeight: 1.35 }}
          >
            {product.title}
          </Text>

          {product.brand && (
            <Text size="xs" c="#998b7d">
              {product.brand}
            </Text>
          )}

          {/* Categoria como variação */}
          <Badge
            size="xs"
            variant="light"
            color="forest"
            style={{ alignSelf: 'flex-start', textTransform: 'capitalize' }}
          >
            {product.category.replace(/-/g, ' ')}
          </Badge>

          <Group justify="space-between" align="center" mt={6} wrap="nowrap">
            {/* Controles de quantidade */}
            <Group gap={4} wrap="nowrap">
              <ActionIcon
                size="sm"
                variant="default"
                radius="sm"
                aria-label="Diminuir quantidade"
                onClick={onDecrement}
                style={{
                  border: '1px solid #d8d0c0',
                  color: quantity === 1 ? '#c0392b' : '#5b5047',
                }}
              >
                {quantity === 1 ? (
                  <IconTrash size={12} />
                ) : (
                  <IconMinus size={12} />
                )}
              </ActionIcon>

              <Box
                style={{
                  minWidth: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f6f4ee',
                  borderRadius: 6,
                  border: '1px solid #e0d8c8',
                }}
              >
                <Text size="sm" fw={700} c="#15120e">
                  {quantity}
                </Text>
              </Box>

              <ActionIcon
                size="sm"
                variant="default"
                radius="sm"
                aria-label="Aumentar quantidade"
                onClick={onIncrement}
                style={{ border: '1px solid #d8d0c0', color: '#2d6a4f' }}
              >
                <IconPlus size={12} />
              </ActionIcon>
            </Group>

            {/* Subtotal da linha */}
            <Text size="sm" fw={700} c="#2d6a4f">
              {BRL.format(lineTotal)}
            </Text>
          </Group>

          {/* Preço unitário */}
          {quantity > 1 && (
            <Text size="xs" c="#998b7d">
              {BRL.format(product.price)} × {quantity} unid.
            </Text>
          )}
        </Stack>

        {/* Botão remover */}
        <ActionIcon
          size="sm"
          variant="subtle"
          color="red"
          radius="sm"
          aria-label={`Remover ${product.title}`}
          onClick={onRemove}
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <IconX size={14} />
        </ActionIcon>
      </Group>
    </Box>
  );
};

// ─── Componente principal: MiniCart ───────────────────────────────────────────

export interface MiniCartProps {
  opened: boolean;
  onClose: () => void;
}

export const MiniCart: React.FC<MiniCartProps> = ({ opened, onClose }) => {
  const { cart, cartTotal, cartCount, updateCartQuantity, removeFromCart, clearCart } =
    useAuth();

  // Controle do modal de confirmação de remoção
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

  const shippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0);
  const hasFreeshipping = cartTotal >= FREE_SHIPPING_THRESHOLD;

  function handleDecrement(item: CartItem) {
    if (item.quantity === 1) {
      // Ao zerar, pede confirmação
      setConfirmRemoveId(item.product.id);
    } else {
      updateCartQuantity(item.product.id, item.quantity - 1);
    }
  }

  function handleIncrement(item: CartItem) {
    updateCartQuantity(item.product.id, item.quantity + 1);
  }

  function handleConfirmRemove() {
    if (confirmRemoveId !== null) {
      removeFromCart(confirmRemoveId);
      setConfirmRemoveId(null);
    }
  }

  return (
    <>
      {/* ─── Gaveta Principal ─────────────────────────────────────────────── */}
      <Drawer
        opened={opened}
        onClose={onClose}
        position="right"
        size={420}
        padding={0}
        title={null}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.35,
          blur: 4,
        }}
        styles={{
          content: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#faf9f6',
            borderLeft: '1px solid #e8e3d8',
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
          },
          overlay: {
            backdropFilter: 'blur(4px)',
          },
        }}
        aria-label="Sacola de compras"
      >
        {/* ── Cabeçalho fixo ─────────────────────────────────────────────── */}
        <Box
          px="xl"
          py="md"
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e8e3d8',
            flexShrink: 0,
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon
                size={36}
                radius="md"
                color="forest"
                variant="light"
                style={{ backgroundColor: '#e2ece4' }}
              >
                <IconShoppingBag size={20} stroke={1.8} color="#2d6a4f" />
              </ThemeIcon>
              <Box>
                <Title
                  order={4}
                  style={{ fontSize: '1.05rem', color: '#15120e', letterSpacing: '-0.3px' }}
                >
                  Minha Sacola
                </Title>
                <Text size="xs" c="#998b7d">
                  {cartCount === 0
                    ? 'Nenhum item adicionado'
                    : `${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
                </Text>
              </Box>
            </Group>

            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              onClick={onClose}
              aria-label="Fechar sacola"
              style={{ color: '#5b5047' }}
            >
              <IconX size={20} />
            </ActionIcon>
          </Group>
        </Box>

        {/* ── Barra de frete grátis ──────────────────────────────────────── */}
        <Box
          px="xl"
          py="sm"
          style={{
            backgroundColor: hasFreeshipping ? '#e8f5e9' : '#f6f4ee',
            borderBottom: '1px solid #e8e3d8',
            flexShrink: 0,
            transition: 'background 400ms ease',
          }}
        >
          <Group gap="xs" mb={6} align="center">
            <IconTruckDelivery
              size={16}
              color={hasFreeshipping ? '#2d6a4f' : '#998b7d'}
              stroke={1.8}
            />
            {hasFreeshipping ? (
              <Text size="xs" fw={700} c="#2d6a4f">
                🎉 Parabéns! Você ganhou Frete Grátis!
              </Text>
            ) : (
              <Text size="xs" fw={500} c="#5b5047">
                Faltam apenas{' '}
                <Text component="span" fw={700} c="#2d6a4f">
                  {BRL.format(remainingForFreeShipping)}
                </Text>{' '}
                para você ganhar Frete Grátis!
              </Text>
            )}
          </Group>

          <Progress
            value={shippingProgress}
            size={6}
            radius="xl"
            color={hasFreeshipping ? 'green' : 'forest'}
            animated={!hasFreeshipping}
            style={{ transition: 'all 400ms ease' }}
          />
        </Box>

        {/* ── Lista de itens (scrollável) ────────────────────────────────── */}
        {cart.length === 0 ? (
          <Center style={{ flex: 1 }}>
            <Stack align="center" gap="md" py="xl">
              <ThemeIcon
                size={72}
                radius="xl"
                variant="light"
                color="gray"
                style={{ backgroundColor: '#f0ece3' }}
              >
                <IconPackageOff size={36} stroke={1.4} color="#b3a793" />
              </ThemeIcon>
              <Stack align="center" gap={4}>
                <Text fw={600} c="#483e32" size="md">
                  Sua sacola está vazia
                </Text>
                <Text size="sm" c="#998b7d" ta="center" style={{ maxWidth: 240 }}>
                  Explore o catálogo e adicione peças que combinem com seu espaço.
                </Text>
              </Stack>
              <Button
                variant="light"
                color="forest"
                size="sm"
                radius="md"
                onClick={onClose}
              >
                Explorar Catálogo
              </Button>
            </Stack>
          </Center>
        ) : (
          <ScrollArea style={{ flex: 1 }} px="xl" scrollbarSize={4}>
            <Stack gap={0}>
              {cart.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onIncrement={() => handleIncrement(item)}
                  onDecrement={() => handleDecrement(item)}
                  onRemove={() => setConfirmRemoveId(item.product.id)}
                />
              ))}
            </Stack>

            {/* Botão limpar tudo */}
            {cart.length > 1 && (
              <Box py="md">
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  leftSection={<IconTrash size={13} />}
                  onClick={() => setConfirmRemoveId(-1)}
                  style={{ opacity: 0.75 }}
                >
                  Limpar toda a sacola
                </Button>
              </Box>
            )}

            {/* Espaço de respiro antes do rodapé */}
            <Box h={24} />
          </ScrollArea>
        )}

        {/* ── Rodapé fixo com subtotal e CTA ────────────────────────────── */}
        {cart.length > 0 && (
          <Box
            px="xl"
            pt="md"
            pb="xl"
            style={{
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e8e3d8',
              flexShrink: 0,
              boxShadow: '0 -8px 24px rgba(0,0,0,0.05)',
            }}
          >
            {/* Subtotal */}
            <Stack gap={6} mb="md">
              <Group justify="space-between">
                <Text size="sm" c="#786b5f">
                  Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
                </Text>
                <Text size="sm" fw={600} c="#483e32">
                  {BRL.format(cartTotal)}
                </Text>
              </Group>

              {hasFreeshipping ? (
                <Group justify="space-between">
                  <Group gap={4}>
                    <IconCheck size={14} color="#2d6a4f" />
                    <Text size="sm" c="#2d6a4f" fw={600}>
                      Frete Grátis
                    </Text>
                  </Group>
                  <Text size="sm" c="#2d6a4f" fw={600} style={{ textDecoration: 'line-through', opacity: 0.6 }}>
                    {BRL.format(25)}
                  </Text>
                </Group>
              ) : (
                <Group justify="space-between">
                  <Text size="sm" c="#998b7d">
                    Frete
                  </Text>
                  <Text size="sm" c="#998b7d">
                    Calculado no checkout
                  </Text>
                </Group>
              )}

              <Divider color="#f0ece3" />

              <Group justify="space-between">
                <Text fw={700} c="#15120e" size="md">
                  Total estimado
                </Text>
                <Text fw={800} c="#2d6a4f" size="lg" style={{ letterSpacing: '-0.5px' }}>
                  {BRL.format(cartTotal)}
                </Text>
              </Group>
            </Stack>

            {/* CTA principal — Finalizar Compra */}
            <Button
              fullWidth
              size="md"
              color="forest"
              radius="md"
              rightSection={<IconArrowRight size={18} />}
              style={{
                backgroundColor: '#2d6a4f',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(45,106,79,0.30)',
                fontSize: '0.975rem',
                letterSpacing: '0.2px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: '#1e4632',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(45,106,79,0.38)',
                  },
                  transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)',
                },
              }}
              aria-label="Finalizar compra"
            >
              Finalizar Compra
            </Button>

            <Text size="xs" c="#998b7d" ta="center" mt="xs">
              🔒 Pagamento 100% seguro e criptografado
            </Text>
          </Box>
        )}
      </Drawer>

      {/* ─── Modal de confirmação de remoção ──────────────────────────────── */}
      <Modal
        opened={confirmRemoveId !== null}
        onClose={() => setConfirmRemoveId(null)}
        title={
          <Group gap="xs">
            <ThemeIcon size={24} color="red" variant="light" radius="sm">
              <IconTrash size={14} />
            </ThemeIcon>
            <Text fw={700} size="sm" c="#15120e">
              {confirmRemoveId === -1 ? 'Limpar sacola?' : 'Remover item?'}
            </Text>
          </Group>
        }
        centered
        radius="lg"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
        styles={{
          content: { backgroundColor: '#ffffff', border: '1px solid #e8e3d8' },
          header: { backgroundColor: '#faf9f6', borderBottom: '1px solid #f0ece3' },
        }}
      >
        <Text size="sm" c="#483e32" mb="lg">
          {confirmRemoveId === -1
            ? 'Todos os itens serão removidos da sua sacola. Deseja continuar?'
            : 'Este item será removido da sua sacola. Deseja continuar?'}
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            size="sm"
            radius="md"
            onClick={() => setConfirmRemoveId(null)}
          >
            Cancelar
          </Button>
          <Button
            color="red"
            size="sm"
            radius="md"
            leftSection={<IconTrash size={14} />}
            onClick={() => {
              if (confirmRemoveId === -1) {
                clearCart();
              } else {
                handleConfirmRemove();
              }
              setConfirmRemoveId(null);
            }}
          >
            {confirmRemoveId === -1 ? 'Limpar tudo' : 'Remover'}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default MiniCart;
