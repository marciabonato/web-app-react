import React, { useState } from "react";
import { MiniCart } from "../MiniCart";
import { SearchModal } from "../SearchModal";
import { FavoritesDrawer } from "../FavoritesDrawer";
import {
  NavLink as RouterNavLink,
  Outlet,
  useLocation,
  Link,
} from "react-router-dom";
import {
  AppShell,
  Burger,
  Group,
  Text,
  Badge,
  ActionIcon,
  Box,
  Container,
  Divider,
  Stack,
  Tooltip,
  Button,
  Avatar,
  Menu,
  UnstyledButton,
  Indicator,
} from "@mantine/core";
import {
  IconHome,
  IconArmchair,
  IconLamp,
  IconBuildingStore,
  IconInfoCircle,
  IconShoppingBag,
  IconHeart,
  IconHeartFilled,
  IconSearch,
  IconSparkles,
  IconUser,
  IconLogin,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  onClick?: () => void;
}

/**
 * Item de navegação persistente utilizando <RouterNavLink> do react-router-dom.
 * Aplica estilos explícitos para o estado ativo e de transição de rota,
 * respeitando a paleta nórdica e minimalista.
 */
const NavigationItem: React.FC<NavItemProps> = ({
  to,
  label,
  icon,
  end = false,
  onClick,
}) => {
  return (
    <RouterNavLink
      to={to}
      end={end}
      onClick={onClick}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "0.925rem",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "#2a4d37" : "#5b5047",
        backgroundColor: isActive ? "#e2ece4" : "transparent",
        borderLeft: isActive ? "4px solid #447c59" : "4px solid transparent",
        transition: "all 160ms cubic-bezier(0.4, 0, 0.2, 1)",
      })}
    >
      <Box style={{ display: "flex", alignItems: "center", color: "inherit" }}>
        {icon}
      </Box>
      <Text size="sm" style={{ color: "inherit", fontWeight: "inherit" }}>
        {label}
      </Text>
    </RouterNavLink>
  );
};

export interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * Layout base estruturado com cabeçalho (Header) e navegação persistente (lateral/drawer)
 * renderizando as rotas filhas através de <Outlet />.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [cartOpened, setCartOpened] = useState<boolean>(false);
  const [searchOpened, setSearchOpened] = useState<boolean>(false);
  const [favoritesOpened, setFavoritesOpened] = useState<boolean>(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, cartCount, favoritesCount } =
    useAuth();

  const navLinks = [
    {
      to: "/",
      label: "Início",
      icon: <IconHome size={19} stroke={1.6} />,
      end: true,
    },
    {
      to: "/produtos",
      label: "Catálogo Completo",
      icon: <IconBuildingStore size={19} stroke={1.6} />,
      end: true,
    },
    {
      to: "/produtos?categoria=furniture",
      label: "Móveis & Armários",
      icon: <IconArmchair size={19} stroke={1.6} />,
    },
    {
      to: "/produtos?categoria=home-decoration",
      label: "Decoração & Luz",
      icon: <IconLamp size={19} stroke={1.6} />,
    },
    {
      to: "/produtos?categoria=textiles",
      label: "Tapetes & Almofadas",
      icon: <IconSparkles size={19} stroke={1.6} />,
    },
    {
      to: "/sobre",
      label: "Conceito Nórdico",
      icon: <IconInfoCircle size={19} stroke={1.6} />,
      end: true,
    },
    ...(!isAuthenticated
      ? [
          {
            to: "/login",
            label: "Entrar / Minha Conta",
            icon: <IconLogin size={19} stroke={1.6} />,
            end: true,
          },
        ]
      : []),
  ];

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{
        width: 270,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      style={{
        backgroundColor: "#faf9f6",
        minHeight: "100vh",
      }}
    >
      {/* Cabeçalho Superior Fixo */}
      <AppShell.Header
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e8e3d8",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <Group justify="space-between" style={{ width: "100%" }}>
          <Group gap="md">
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
              color="#35383c"
              aria-label="Alternar navegação lateral"
            />

            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Box
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: "#447c59",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(68, 124, 89, 0.25)",
                }}
              >
                <IconSparkles size={22} stroke={1.8} />
              </Box>

              <Box>
                <Group gap={6} align="center">
                  <Text
                    fw={700}
                    size="lg"
                    style={{ letterSpacing: "-0.4px", color: "#222528" }}
                  >
                    Nordic Nest
                  </Text>
                  <Badge size="xs" color="forest" variant="light">
                    Home & Design
                  </Badge>
                </Group>
                <Text
                  size="xs"
                  c="#786b5f"
                  style={{ marginTop: -2, letterSpacing: "0.2px" }}
                >
                  Mobiliário e Decoração Escandinava
                </Text>
              </Box>
            </Link>
          </Group>

          <Group gap="sm">
            <Tooltip label="Pesquisar catálogo" position="bottom">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="md"
                aria-label="Buscar produtos"
                onClick={() => setSearchOpened(true)}
              >
                <IconSearch size={20} stroke={1.5} color="#5b5047" />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Favoritos" position="bottom">
              <Indicator
                inline
                label={favoritesCount > 0 ? favoritesCount : undefined}
                size={18}
                disabled={favoritesCount === 0}
                color="terracotta"
                offset={4}
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  radius="md"
                  aria-label="Lista de desejos"
                  onClick={() => setFavoritesOpened(true)}
                >
                  {favoritesCount > 0 ? (
                    <IconHeartFilled size={20} color="#cb4b20" />
                  ) : (
                    <IconHeart size={20} stroke={1.5} color="#5b5047" />
                  )}
                </ActionIcon>
              </Indicator>
            </Tooltip>

            <Tooltip label="Sacola de Design" position="bottom">
              <Indicator
                inline
                label={cartCount > 0 ? cartCount : undefined}
                size={18}
                disabled={cartCount === 0}
                color="terracotta"
                offset={4}
              >
                <ActionIcon
                  variant="filled"
                  color="forest"
                  size="lg"
                  radius="md"
                  aria-label="Sacola de compras"
                  onClick={() => setCartOpened(true)}
                  style={{
                    backgroundColor: "#2d6a4f",
                    transition: "transform 180ms ease, box-shadow 180ms ease",
                  }}
                >
                  <IconShoppingBag size={20} stroke={1.8} />
                </ActionIcon>
              </Indicator>
            </Tooltip>

            {/* Seção de Autenticação no Cabeçalho */}
            {isAuthenticated && user ? (
              <Menu shadow="md" width="auto" position="bottom-end" radius="md">
                <Menu.Target>
                  <UnstyledButton
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      backgroundColor: "#f6f4ee",
                      border: "1px solid #d8d0c0",
                    }}
                  >
                    <Avatar
                      src={user.image}
                      alt={user.firstName}
                      size="sm"
                      radius="xl"
                      color="forest"
                    >
                      {user.firstName[0]}
                    </Avatar>
                    <Box style={{ textAlign: "left" }} visibleFrom="xs">
                      <Text size="xs" fw={700} c="#15120e" lineClamp={1}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text size="10px" c="#6b5e4c" lineClamp={1}>
                        Membro Ativo
                      </Text>
                    </Box>
                    <IconChevronDown size={14} color="#6b5e4c" />
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown style={{ minWidth: 240, maxWidth: 360 }}>
                  <Menu.Label>Conta de Membro</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={14} />}
                    style={{ cursor: "default" }}
                  >
                    <Text
                      size="xs"
                      c="#5b5047"
                      style={{
                        wordBreak: "break-all",
                        whiteSpace: "normal",
                      }}
                    >
                      {user.email}
                    </Text>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={logout}
                  >
                    Encerrar Sessão
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button
                component={Link}
                to="/login"
                state={{ from: `${location.pathname}${location.search}` }}
                variant="filled"
                color="forest"
                size="xs"
                radius="md"
                leftSection={<IconLogin size={14} />}
                style={{
                  backgroundColor: "#2d6a4f",
                  fontWeight: 600,
                }}
              >
                Entrar
              </Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Menu de Navegação Persistente Lateral */}
      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e8e3d8",
        }}
      >
        <Stack justify="space-between" style={{ height: "100%" }}>
          <Stack gap={6}>
            <Text
              size="xs"
              fw={700}
              c="#998b7d"
              style={{
                textTransform: "uppercase",
                letterSpacing: "1px",
                padding: "4px 12px",
              }}
            >
              Coleções & Navegação
            </Text>

            {navLinks.map((item) => (
              <NavigationItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
                onClick={() => setOpened(false)}
              />
            ))}
          </Stack>

          {/* Destaque Estético Inferior ou Informações do Usuário */}
          {isAuthenticated && user ? (
            <Box
              p="md"
              style={{
                backgroundColor: "#f6f4ee",
                borderRadius: "12px",
                border: "1px solid #d8d0c0",
              }}
            >
              <Group justify="space-between" mb={6}>
                <Group gap="xs">
                  <Avatar
                    src={user.image}
                    size="sm"
                    radius="xl"
                    color="forest"
                  />
                  <Box style={{ minWidth: 0, flex: 1 }}>
                    <Text size="xs" fw={700} c="#15120e" lineClamp={1}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text
                      size="10px"
                      c="#6b5e4c"
                      style={{ wordBreak: "break-all" }}
                    >
                      {user.email}
                    </Text>
                  </Box>
                </Group>
              </Group>

              <Button
                variant="subtle"
                color="red"
                size="xs"
                fullWidth
                leftSection={<IconLogout size={14} />}
                onClick={logout}
                mt="xs"
              >
                Sair da Conta
              </Button>
            </Box>
          ) : (
            <Box
              p="md"
              style={{
                backgroundColor: "#faf9f6",
                borderRadius: "12px",
                border: "1px solid #e8e3d8",
              }}
            >
              <Group gap="xs" mb={4}>
                <Badge color="terracotta" size="sm" variant="filled">
                  Área de Membros
                </Badge>
              </Group>
              <Text size="xs" fw={600} c="#222528">
                Preços & Sacola Restritos
              </Text>
              <Text size="xs" c="#786b5f" mt={2} mb="xs">
                Faça login para desbloquear valores, descontos e compras no
                catálogo.
              </Text>
              <Button
                component={Link}
                to="/login"
                variant="light"
                color="forest"
                size="xs"
                fullWidth
                leftSection={<IconLogin size={14} />}
              >
                Acessar Minha Conta
              </Button>
            </Box>
          )}
        </Stack>
      </AppShell.Navbar>

      {/* Mini Cart — gaveta lateral sobreposta */}
      <MiniCart opened={cartOpened} onClose={() => setCartOpened(false)} />

      {/* Modal de Busca Rápida / Spotlight */}
      <SearchModal
        opened={searchOpened}
        onClose={() => setSearchOpened(false)}
      />

      {/* Drawer de Peças Favoritas */}
      <FavoritesDrawer
        opened={favoritesOpened}
        onClose={() => setFavoritesOpened(false)}
        onOpenCart={() => setCartOpened(true)}
      />

      {/* Área Principal de Renderização com <Outlet /> */}
      <AppShell.Main>
        <Container size="xl" py="lg">
          {children ?? <Outlet key={location.pathname + location.search} />}
        </Container>

        {/* Rodapé Elegante Minimalista */}
        <Box
          mt={60}
          py={30}
          style={{ borderTop: "1px solid #e8e3d8", textAlign: "center" }}
        >
          <Container size="xl">
            <Group justify="space-between" wrap="wrap" gap="md">
              <Text size="sm" c="#786b5f">
                © {new Date().getFullYear()} Nordic Nest — Home & Design.
                Projeto Acadêmico UTFPR.
              </Text>
              <Group gap="lg">
                <Text size="xs" c="#998b7d">
                  Mantine UI v7+
                </Text>
                <Divider orientation="vertical" />
                <Text size="xs" c="#998b7d">
                  React 19 & TypeScript
                </Text>
                <Divider orientation="vertical" />
                <Text size="xs" c="#998b7d">
                  Vite + React Router v7
                </Text>
              </Group>
            </Group>
          </Container>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};
