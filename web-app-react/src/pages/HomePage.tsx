import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Title,
  Text,
  Button,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Group,
  Stack,
  Box,
  Skeleton,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowRight,
  IconLeaf,
  IconShieldHeart,
  IconRecycle,
  IconArmchair,
  IconLamp,
  IconSparkles,
  IconLock,
} from '@tabler/icons-react';
import type { Product } from '../types/product';
import { fetchHomeDesignProducts } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import heroImage from '../assets/hero-nordic.jpg';

const CATEGORY_NAMES: Record<string, string> = {
  furniture: 'Móveis',
  'home-decoration': 'Decoração',
  textiles: 'Têxteis',
};

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeatured(): Promise<void> {
      try {
        setLoading(true);
        // Obtém o acervo filtrado com foco em móveis, decoração e têxteis
        const allProducts = await fetchHomeDesignProducts('all', controller.signal);

        // Seleciona peças emblemáticas em destaque
        const curated = [
          allProducts.find((p) => p.id === 203) || allProducts[0], // Armário Buffet
          allProducts.find((p) => p.id === 201) || allProducts[1], // Tapete Boreal
          allProducts.find((p) => p.id === 202) || allProducts[2], // Almofadas Linho
          allProducts.find((p) => p.id === 14) || allProducts[3],  // Cadeira Knoll Saarinen
        ].filter(Boolean) as Product[];

        setFeatured(curated);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.error('Falha ao carregar produtos em destaque', e);
      } finally {
        setLoading(false);
      }
    }

    void loadFeatured();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Stack gap={60}>
      {/* Banner Hero com Estética Minimalista Nórdica */}
      <Box
        p={{ base: 24, sm: 36, md: 50 }}
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #e4eee7 0%, #faf9f6 55%, #f4efe6 100%)',
          border: '1px solid #bed8c7',
          overflow: 'hidden',
        }}
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'xl', md: 40 }} style={{ alignItems: 'center' }}>
          <Stack gap="md">
            <Group gap="xs">
              <Badge color="forest" variant="filled" size="md">
                Coleção Nórdica 2026
              </Badge>
              <Text size="xs" fw={600} c="#447c59">
                Mobiliário, Decoração & Têxteis Acolhedores
              </Text>
            </Group>

            <Title
              order={1}
              style={{
                fontSize: 'clamp(1.9rem, 3.2vw, 3rem)',
                color: '#1e3828',
                letterSpacing: '-1px',
                lineHeight: 1.15,
              }}
            >
              Design Puro & Funcional para Ambientes Vivos.
            </Title>

            <Text size="md" c="#5b5047" style={{ lineHeight: 1.6 }}>
              Do aconchego tátil dos tapetes de lã pura e almofadas de linho belga à imponência
              dos armários e sofás em carvalho maciço. Uma curadoria autêntica sem excessos.
            </Text>

            <Group gap="md" mt="sm">
              <Button
                component={Link}
                to="/produtos"
                color="forest"
                size="lg"
                rightSection={<IconArrowRight size={18} />}
              >
                Explorar Catálogo de Design
              </Button>
              <Button
                component={Link}
                to="/sobre"
                variant="outline"
                color="forest"
                size="lg"
              >
                Conceito Nórdico
              </Button>
            </Group>
          </Stack>

          {/* Imagem Temática Nórdica de Alta Resolução */}
          <Box
            style={{
              position: 'relative',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 20px 35px -10px rgba(30, 56, 40, 0.16)',
              border: '1px solid rgba(190, 216, 199, 0.8)',
              background: '#f0f5f1',
            }}
          >
            <Image
              src={heroImage}
              alt="Ambiente de sala de estar nórdica minimalista com poltrona acolhedora e móvel em carvalho maciço"
              radius="lg"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: 380,
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              style={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: 20,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              <Group gap={8}>
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#2d6a4f',
                  }}
                />
                <Text size="xs" fw={700} c="#1e3828">
                  Espaço Hygge • Carvalho & Linho Belga
                </Text>
              </Group>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Destaques das 3 Categorias Essenciais */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card
          padding="lg"
          radius="lg"
          withBorder
          component={Link}
          to="/produtos?categoria=furniture"
          style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            borderColor: '#e8e3d8',
            transition: 'all 200ms ease',
          }}
        >
          <Stack gap="xs">
            <ThemeIcon size={46} radius="md" color="forest" variant="light">
              <IconArmchair size={26} />
            </ThemeIcon>
            <Title order={3} size="h4" c="#222528">
              Móveis & Armários
            </Title>
            <Text size="xs" c="#786b5f">
              Buffets em carvalho maciço, estantes modulares, sofás e poltronas ergonômicas.
            </Text>
            <Button variant="subtle" color="forest" size="xs" p={0} rightSection={<IconArrowRight size={14} />}>
              Ver Móveis
            </Button>
          </Stack>
        </Card>

        <Card
          padding="lg"
          radius="lg"
          withBorder
          component={Link}
          to="/produtos?categoria=home-decoration"
          style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            borderColor: '#e8e3d8',
            transition: 'all 200ms ease',
          }}
        >
          <Stack gap="xs">
            <ThemeIcon size={46} radius="md" color="terracotta" variant="light">
              <IconLamp size={26} />
            </ThemeIcon>
            <Title order={3} size="h4" c="#222528">
              Decoração & Luz
            </Title>
            <Text size="xs" c="#786b5f">
              Luminárias pendentes esculturais, espelhos orgânicos em nogueira e vasos esculpidos.
            </Text>
            <Button variant="subtle" color="terracotta" size="xs" p={0} rightSection={<IconArrowRight size={14} />}>
              Ver Decoração
            </Button>
          </Stack>
        </Card>

        <Card
          padding="lg"
          radius="lg"
          withBorder
          component={Link}
          to="/produtos?categoria=textiles"
          style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            borderColor: '#e8e3d8',
            transition: 'all 200ms ease',
          }}
        >
          <Stack gap="xs">
            <ThemeIcon size={46} radius="md" color="forest" variant="light">
              <IconSparkles size={26} />
            </ThemeIcon>
            <Title order={3} size="h4" c="#222528">
              Tapetes & Almofadas
            </Title>
            <Text size="xs" c="#786b5f">
              Tapetes tramados em pura lã, almofadas em linho lavado e mantas térmicas aconchegantes.
            </Text>
            <Button variant="subtle" color="forest" size="xs" p={0} rightSection={<IconArrowRight size={14} />}>
              Ver Têxteis
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Destaques em Vitrine da Curadoria */}
      <Box>
        <Group justify="space-between" mb="lg">
          <Box>
            <Text size="xs" fw={700} c="#447c59" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
              Curadoria de Destaque
            </Text>
            <Title order={2} c="#222528">
              Peças Selecionadas do Acervo
            </Title>
          </Box>
          <Button component={Link} to="/produtos" variant="subtle" color="forest" rightSection={<IconArrowRight size={16} />}>
            Ver Catálogo Completo
          </Button>
        </Group>

        {loading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={320} radius="lg" />
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {featured.map((item) => (
              <Card
                key={item.id}
                component={Link}
                to={`/produtos/${item.id}`}
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
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
              >
                <Box>
                  <Card.Section p="xs" style={{ backgroundColor: '#f6f4ee' }}>
                    <Image
                      src={item.thumbnail}
                      height={200}
                      fit="cover"
                      alt={item.title}
                      fallbackSrc="https://placehold.co/400x300?text=Design+Nordico"
                      style={{ borderRadius: '8px' }}
                    />
                  </Card.Section>

                  <Group justify="space-between" mt="md" mb="xs">
                    <Badge color="forest" variant="light" size="xs">
                      {CATEGORY_NAMES[item.category] ?? item.category}
                    </Badge>
                    <Text size="xs" fw={700} c="#2d6a4f">
                      ★ {(item.rating ?? 4.8).toFixed(1)}
                    </Text>
                  </Group>

                  <Text fw={700} size="sm" c="#15120e" lineClamp={1}>
                    {item.title}
                  </Text>
                  <Text size="xs" c="#483e32" lineClamp={2} mt={6} style={{ lineHeight: 1.5 }}>
                    {item.description}
                  </Text>
                </Box>

                <Group justify="space-between" align="center" mt="md" pt="sm" style={{ borderTop: '1px solid #e9e4d8' }}>
                  {isAuthenticated ? (
                    <Text fw={800} size="1.15rem" c="#143323">
                      ${(item.price ?? 0).toFixed(2)}
                    </Text>
                  ) : (
                    <Box>
                      <Group gap={4} align="center">
                        <IconLock size={12} color="#cb4b20" />
                        <Text size="10px" fw={700} c="#cb4b20" style={{ textTransform: 'uppercase' }}>
                          Membros
                        </Text>
                      </Group>
                      <Text fw={700} size="11px" c="#6b5e4c">
                        Preço sob login
                      </Text>
                    </Box>
                  )}

                  <Button
                    size="xs"
                    color="forest"
                    variant="filled"
                    rightSection={<IconArrowRight size={14} />}
                    style={{ backgroundColor: '#2d6a4f', pointerEvents: 'none' }}
                  >
                    Ver Detalhes
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Pilares da Marca Nórdica */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
        <Group align="flex-start" gap="md">
          <ThemeIcon size={42} radius="xl" color="forest" variant="light">
            <IconLeaf size={22} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="sm" c="#222528">
              Origem Sustentável
            </Text>
            <Text size="xs" c="#786b5f" mt={4}>
              Materiais ecológicos, madeiras certificadas e lã pura sem processos químicos nocivos.
            </Text>
          </Box>
        </Group>

        <Group align="flex-start" gap="md">
          <ThemeIcon size={42} radius="xl" color="forest" variant="light">
            <IconRecycle size={22} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="sm" c="#222528">
              Longevidade & Função
            </Text>
            <Text size="xs" c="#786b5f" mt={4}>
              Mobiliário e adornos projetados para resistir ao tempo e passar por gerações.
            </Text>
          </Box>
        </Group>

        <Group align="flex-start" gap="md">
          <ThemeIcon size={42} radius="xl" color="forest" variant="light">
            <IconShieldHeart size={22} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="sm" c="#222528">
              Garantia & Autenticidade
            </Text>
            <Text size="xs" c="#786b5f" mt={4}>
              Curadoria com procedência verificada, acabamento manual e política Hygge de troca.
            </Text>
          </Box>
        </Group>
      </SimpleGrid>
    </Stack>
  );
};
