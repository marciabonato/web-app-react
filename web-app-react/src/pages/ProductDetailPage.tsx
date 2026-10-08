import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Image,
  Text,
  Title,
  Badge,
  Group,
  Stack,
  Button,
  Card,
  Rating,
  Divider,
  Breadcrumbs,
  Anchor,
  Skeleton,
  Alert,
  SimpleGrid,
  Box,
  ThemeIcon,
  NumberInput,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconArrowLeft,
  IconTruckDelivery,
  IconShieldCheck,
  IconRotateClockwise2,
  IconCheck,
  IconAlertCircle,
  IconShoppingCartPlus,
  IconHeart,
  IconHeartFilled,
  IconRuler2,
  IconPackage,
  IconLock,
  IconTrash,
} from '@tabler/icons-react';
import type { Product } from '../types/product';
import { fetchProductById } from '../services/productService';
import { useAuth } from '../hooks/useAuth';

interface CartFormValues {
  quantity: number;
}

/**
 * Página de Detalhes do Produto (/produtos/:id).
 * Captura o parâmetro dinâmico e suporta navegação de retorno à página exata de origem.
 */
export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, addToCart, removeFromCart, toggleFavorite, isFavorite } = useAuth();

  // URL exata de origem preservada da listagem (incluindo página e filtros)
  const locationState = location.state as { from?: string } | null;
  const fromUrl = locationState?.from;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // Formulário de quantidade com @mantine/form
  const cartForm = useForm<CartFormValues>({
    mode: 'uncontrolled',
    initialValues: { quantity: 1 },
    validate: {
      quantity: (value) => {
        if (!value || value < 1) return 'Quantidade mínima é 1.';
        if (product && value > (product.stock || 10)) return `Máximo disponível: ${product.stock || 10}.`;
        return null;
      },
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProductDetails(): Promise<void> {
      if (!id) {
        setError('Identificador de produto não fornecido.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(id, controller.signal);
        setProduct(data);
        // Atualiza o máximo do formulário com o estoque real
        cartForm.setFieldValue('quantity', 1);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocorreu um erro inesperado ao carregar os detalhes do produto.');
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchProductDetails();
    return () => { controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBack = (): void => {
    if (fromUrl) {
      navigate(fromUrl);
    } else {
      navigate(-1);
    }
  };

  const handleAddToCart = (values: CartFormValues): void => {
    if (!product) return;
    addToCart(product, values.quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 4000);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Skeleton height={28} width={260} mb="xl" radius="sm" />
        <Grid gap={40}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Skeleton height={460} radius="lg" mb="md" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Skeleton height={24} width={140} radius="sm" />
              <Skeleton height={42} width="85%" radius="md" />
              <Skeleton height={20} width={180} radius="sm" />
              <Skeleton height={50} width={200} radius="md" />
              <Skeleton height={100} radius="md" />
              <Skeleton height={48} radius="md" />
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container size="sm" py={60}>
        <Alert
          icon={<IconAlertCircle size={22} />}
          title="Erro ao Carregar Produto"
          color="red"
          variant="light"
          radius="md"
        >
          {error ?? 'Não foi possível encontrar as informações desta peça.'}
        </Alert>
        <Group justify="center" mt="xl">
          <Button
            leftSection={<IconArrowLeft size={18} />}
            variant="default"
            onClick={handleBack}
            style={{ fontWeight: 600, flexShrink: 0 }}
          >
            Voltar para a Listagem
          </Button>
        </Group>
      </Container>
    );
  }

  const categoryDisplay =
    product.category === 'furniture'
      ? 'Móveis & Armários'
      : product.category === 'home-decoration'
        ? 'Decoração & Luz'
        : product.category === 'textiles'
          ? 'Tapetes & Almofadas'
          : product.category;

  const breadcrumbItems = [
    { title: 'Início', href: '/' },
    { title: 'Catálogo', href: fromUrl ?? '/produtos' },
    { title: categoryDisplay, href: `/produtos?categoria=${encodeURIComponent(product.category)}` },
    { title: product.title, href: '#' },
  ].map((item, index) => {
    if (index === 3) {
      return (
        <Text key={item.title} size="sm" fw={700} c="#15120e">
          {item.title}
        </Text>
      );
    }
    return (
      <Anchor component={Link} to={item.href} key={item.title} size="sm" c="#6b5e4c" fw={500}>
        {item.title}
      </Anchor>
    );
  });

  return (
    <Container size="xl" py="md">
      {/* Navegação de Topo e Breadcrumbs */}
      <Group
        justify="space-between"
        align="center"
        mb="lg"
        gap="sm"
        wrap="wrap"
        style={{ width: '100%' }}
      >
        <Box
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Breadcrumbs
            separator="›"
            style={{
              flexWrap: 'nowrap',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {breadcrumbItems}
          </Breadcrumbs>
        </Box>
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
          style={{
            fontWeight: 600,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Voltar para a Listagem
        </Button>
      </Group>

      {/* Grid Principal: Imagem e Informações de Compra */}
      <Grid gap={{ base: 24, md: 48 }}>
        {/* Coluna 1: Imagem do Produto */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card
            padding={0}
            radius="lg"
            withBorder
            style={{
              overflow: 'hidden',
              backgroundColor: '#f6f4ee',
              borderColor: '#d8d0c0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box
              style={{
                height: 480,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
              }}
            >
              <Image
                src={product.thumbnail}
                alt={product.title}
                fit="cover"
                height={480}
                fallbackSrc="https://placehold.co/600x480?text=Design+Nordico"
                style={{
                  width: '100%',
                  transition: 'transform 400ms ease',
                }}
              />
            </Box>
          </Card>

          {/* Especificações Técnicas */}
          <Card mt="xl" radius="lg" withBorder padding="lg" style={{ backgroundColor: '#ffffff', borderColor: '#d8d0c0' }}>
            <Title order={4} mb="md" c="#15120e">
              Especificações & Medidas Nórdicas
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Group gap="sm">
                <ThemeIcon variant="light" color="forest" size="lg" radius="md">
                  <IconRuler2 size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="#6b5e4c">Dimensões (L x A x P)</Text>
                  <Text size="sm" fw={700} c="#15120e">
                    {product.dimensions
                      ? `${product.dimensions.width}cm x ${product.dimensions.height}cm x ${product.dimensions.depth}cm`
                      : 'Sob consulta técnica'}
                  </Text>
                </Box>
              </Group>

              <Group gap="sm">
                <ThemeIcon variant="light" color="forest" size="lg" radius="md">
                  <IconPackage size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="#6b5e4c">Peso Estrutural</Text>
                  <Text size="sm" fw={700} c="#15120e">
                    {product.weight ? `${product.weight} kg` : 'Leve / Confortável'}
                  </Text>
                </Box>
              </Group>
            </SimpleGrid>
          </Card>
        </Grid.Col>

        {/* Coluna 2: Informações de Compra e Ações */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            {/* Categoria, Marca e Status */}
            <Group justify="space-between" wrap="wrap">
              <Group gap="xs">
                <Badge color="forest" variant="light" size="md">
                  {categoryDisplay}
                </Badge>
                {product.brand && (
                  <Badge color="gray" variant="outline" size="md">
                    {product.brand}
                  </Badge>
                )}
              </Group>

              <Badge
                color={product.stock > 0 ? 'teal' : 'red'}
                variant="dot"
                size="md"
              >
                {product.availabilityStatus ?? (product.stock > 0 ? 'Em estoque' : 'Esgotado')}
              </Badge>
            </Group>

            {/* Título do Produto */}
            <Title
              order={1}
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                lineHeight: 1.25,
                color: '#15120e',
                letterSpacing: '-0.5px',
                fontWeight: 800,
              }}
            >
              {product.title}
            </Title>

            {/* Avaliações */}
            <Group gap="xs" align="center" wrap="wrap">
              <Rating value={product.rating ?? 4.8} fractions={2} readOnly color="forest" />
              <Text size="sm" fw={700} c="#143323">
                {(product.rating ?? 4.8).toFixed(1)}
              </Text>
              <Text size="xs" fw={600} c="#2d6a4f">
                (Avaliação de designers: {(product.rating ?? 4.8).toFixed(1)} / 5.0)
              </Text>
              <Divider orientation="vertical" />
              <Text size="xs" c="#8f816c">
                SKU: {product.sku || `ND-${product.id}`}
              </Text>
            </Group>

            {/* Preço (exclusivo para autenticados) */}
            {isAuthenticated ? (
              <Box
                p="md"
                style={{
                  backgroundColor: '#f6f4ee',
                  borderRadius: '12px',
                  border: '1px solid #d8d0c0',
                }}
              >
                <Group align="flex-end" gap="sm" wrap="wrap">
                  <Text
                    fw={800}
                    size="2.2rem"
                    style={{ color: '#143323', lineHeight: 1 }}
                  >
                    ${(product.price ?? 0).toFixed(2)}
                  </Text>

                  {(product.discountPercentage ?? 0) > 0 && (product.discountPercentage ?? 0) < 100 && (
                    <>
                      <Text td="line-through" c="#8f816c" size="md" style={{ marginBottom: 4 }}>
                        ${((product.price ?? 0) / (1 - (product.discountPercentage ?? 0) / 100)).toFixed(2)}
                      </Text>
                      <Badge color="terracotta" variant="filled" size="sm" mb={4}>
                        -{Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    </>
                  )}
                </Group>

                <Text size="xs" c="#6b5e4c" mt={6}>
                  Em até 10x sem juros de ${((product.price ?? 0) / 10).toFixed(2)} no cartão.
                </Text>
              </Box>
            ) : (
              <Box
                p="md"
                style={{
                  backgroundColor: '#fbf9f4',
                  borderRadius: '12px',
                  border: '1px dashed #c9bda8',
                }}
              >
                <Group gap="xs" mb={4}>
                  <ThemeIcon size="sm" color="terracotta" variant="light" radius="xl">
                    <IconLock size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={700} c="#15120e">
                    Valor Exclusivo para Membros
                  </Text>
                </Group>
                <Text size="xs" c="#6b5e4c" mb="sm" style={{ lineHeight: 1.5 }}>
                  Para visualizar o valor desta peça, descontos aplicados e opções de parcelamento,
                  acesse sua conta.
                </Text>
                <Button
                  component={Link}
                  to="/login"
                  state={{ from: `${location.pathname}${location.search}` }}
                  size="xs"
                  color="forest"
                  variant="light"
                  leftSection={<IconLock size={14} />}
                  style={{ fontWeight: 600 }}
                >
                  Entrar para Visualizar Preço
                </Button>
              </Box>
            )}

            {/* Descrição do Produto */}
            <Box>
              <Text size="sm" fw={700} c="#15120e" mb={4}>
                Conceito & Detalhes da Peça:
              </Text>
              <Text size="sm" c="#483e32" style={{ lineHeight: 1.6 }}>
                {product.description}
              </Text>
            </Box>

            <Divider color="#e9e4d8" />

            {/* Alerta de adição à sacola com botão de excluir */}
            {addedSuccess && (
              <Alert
                icon={<IconCheck size={16} />}
                title="Peça adicionada!"
                color="teal"
                variant="light"
                radius="md"
                withCloseButton
                onClose={() => setAddedSuccess(false)}
              >
                <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                  <Text size="sm">
                    {cartForm.getValues().quantity}x &ldquo;{product.title}&rdquo; na sacola.
                  </Text>
                  <Tooltip label="Remover da sacola" position="top" withArrow>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      radius="md"
                      aria-label="Remover produto da sacola"
                      onClick={() => {
                        removeFromCart(product.id);
                        setAddedSuccess(false);
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Alert>
            )}

            {/* Formulário de Quantidade e Botões — gerenciado por @mantine/form */}
            <form onSubmit={cartForm.onSubmit(handleAddToCart)}>
              <Box pos="relative">
                <LoadingOverlay
                  visible={false}
                  overlayProps={{ radius: 'sm', blur: 2 }}
                />
                <Group gap="md" align="flex-end" wrap="wrap">
                  <Box style={{ width: 80, flexShrink: 0 }}>
                    <NumberInput
                      label="Qtd."
                      min={1}
                      max={product.stock || 10}
                      radius="md"
                      size="sm"
                      disabled={!isAuthenticated}
                      key={cartForm.key('quantity')}
                      {...cartForm.getInputProps('quantity')}
                    />
                  </Box>

                  {isAuthenticated ? (
                    <Button
                      type="submit"
                      size="md"
                      color="forest"
                      leftSection={<IconShoppingCartPlus size={20} />}
                      disabled={(product.stock ?? 0) <= 0 && product.availabilityStatus === 'Esgotado'}
                      style={{
                        flex: '1 1 140px',
                        minWidth: 140,
                        backgroundColor: '#2d6a4f',
                        boxShadow: '0 4px 12px rgba(45, 106, 79, 0.25)',
                        fontWeight: 700,
                      }}
                    >
                      Adicionar
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      to="/login"
                      state={{ from: `${location.pathname}${location.search}` }}
                      size="md"
                      color="forest"
                      leftSection={<IconLock size={18} />}
                      style={{
                        flex: '1 1 140px',
                        minWidth: 140,
                        backgroundColor: '#2d6a4f',
                        boxShadow: '0 4px 12px rgba(45, 106, 79, 0.25)',
                        fontWeight: 700,
                      }}
                    >
                      Login
                    </Button>
                  )}

                  <Tooltip
                    label={product && isFavorite(product.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                    position="top"
                    withArrow
                  >
                    <Button
                      variant={product && isFavorite(product.id) ? 'filled' : 'light'}
                      color={product && isFavorite(product.id) ? 'terracotta' : 'gray'}
                      size="md"
                      aria-label={product && isFavorite(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      onClick={() => product && toggleFavorite(product)}
                      style={{
                        flexShrink: 0,
                        backgroundColor: product && isFavorite(product.id) ? '#cb4b20' : undefined,
                        color: product && isFavorite(product.id) ? '#ffffff' : '#483e32',
                        transition: 'all 180ms ease',
                      }}
                    >
                      {product && isFavorite(product.id) ? (
                        <IconHeartFilled size={20} />
                      ) : (
                        <IconHeart size={20} color="#483e32" />
                      )}
                    </Button>
                  </Tooltip>
                </Group>
              </Box>
            </form>

            {/* Benefícios e Políticas */}
            <Stack gap="xs" mt="sm">
              <Group gap="xs">
                <ThemeIcon size="sm" color="forest" variant="light" radius="xl">
                  <IconTruckDelivery size={14} />
                </ThemeIcon>
                <Text size="xs" c="#483e32">
                  {product.shippingInformation ?? 'Frete gratuito para capitais e regiões metropolitanas.'}
                </Text>
              </Group>

              <Group gap="xs">
                <ThemeIcon size="sm" color="forest" variant="light" radius="xl">
                  <IconShieldCheck size={14} />
                </ThemeIcon>
                <Text size="xs" c="#483e32">
                  {product.warrantyInformation ?? 'Garantia de 2 anos com certificação de autenticidade.'}
                </Text>
              </Group>

              <Group gap="xs">
                <ThemeIcon size="sm" color="forest" variant="light" radius="xl">
                  <IconRotateClockwise2 size={14} />
                </ThemeIcon>
                <Text size="xs" c="#483e32">
                  {product.returnPolicy ?? 'Devolução facilitada em até 30 dias.'}
                </Text>
              </Group>
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Avaliações dos Designers */}
      {product.reviews && product.reviews.length > 0 && (
        <Box mt={60}>
          <Title order={3} mb="lg" c="#15120e">
            Avaliações e Críticas de Design
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {product.reviews.map((rev, index) => {
              const formattedDate = rev.date
                ? !isNaN(new Date(rev.date).getTime())
                  ? new Date(rev.date).toLocaleDateString('pt-BR')
                  : rev.date
                : 'Recente';
              return (
                <Card key={index} padding="md" radius="md" withBorder style={{ backgroundColor: '#ffffff', borderColor: '#d8d0c0' }}>
                  <Group justify="space-between" mb="xs">
                    <Text fw={700} size="sm" c="#15120e">
                      {rev.reviewerName}
                    </Text>
                    <Group gap={6} align="center">
                      <Rating value={rev.rating ?? 5} readOnly size="xs" color="forest" />
                      <Text size="xs" fw={700} c="#2d6a4f">
                        {(rev.rating ?? 5).toFixed(1)}
                      </Text>
                    </Group>
                  </Group>
                  <Text size="sm" c="#483e32" fs="italic">
                    &ldquo;{rev.comment}&rdquo;
                  </Text>
                  <Group gap={4} mt="sm">
                    <IconCheck size={14} color="#2d6a4f" />
                    <Text size="xs" c="#6b5e4c">
                      Parecer de design verificado • {formattedDate}
                    </Text>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        </Box>
      )}
    </Container>
  );
};
