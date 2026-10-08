import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Container,
  Card,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Checkbox,
  Stack,
  Group,
  Alert,
  Badge,
  Box,
  ThemeIcon,
  Divider,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "../schemas/zodResolver";
import {
  IconLock,
  IconMail,
  IconAlertCircle,
  IconCheck,
  IconSparkles,
  IconUser,
  IconArrowRight,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { loginFormSchema, type LoginFormValues } from "../schemas/authSchema";

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError, isAuthenticated, user } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as { from?: string } | null;
  const redirectTarget = locationState?.from ?? "/produtos";

  const form = useForm<LoginFormValues>({
    mode: "uncontrolled",
    initialValues: {
      email: "emily.johnson@x.dummyjson.com",
      password: "emilyspass",
      rememberMe: true,
    },
    validate: zodResolver(loginFormSchema),
  });

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    clearError();
    try {
      await login({
        email: values.email.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      });
      navigate(redirectTarget, { replace: true });
    } catch {
      // Erro tratado e armazenado no estado do AuthContext
    }
  };

  const handleFillDemoUser = (demoEmail: string, demoPass: string): void => {
    form.setValues({ email: demoEmail, password: demoPass });
    form.clearErrors();
    clearError();
  };

  if (isAuthenticated && user) {
    return (
      <Container size="xs" py={80}>
        <Card
          padding="xl"
          radius="lg"
          withBorder
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#bed8c7",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(45, 106, 79, 0.08)",
          }}
        >
          <ThemeIcon
            size={56}
            radius="xl"
            color="forest"
            variant="light"
            mx="auto"
            mb="md"
          >
            <IconCheck size={30} />
          </ThemeIcon>
          <Title order={2} c="#143323" style={{ fontSize: "1.5rem" }}>
            Sessão Ativa
          </Title>
          <Text size="sm" c="#483e32" mt="xs">
            Você já está conectado como{" "}
            <strong>
              {user.firstName} {user.lastName}
            </strong>{" "}
            ({user.email}).
          </Text>
          <Group justify="center" mt="xl">
            <Button
              component={Link}
              to="/produtos"
              color="forest"
              size="md"
              rightSection={<IconArrowRight size={16} />}
            >
              Ir para o Catálogo de Peças
            </Button>
          </Group>
        </Card>
      </Container>
    );
  }

  const currentEmail = form.getValues().email;

  return (
    <Container size="xs" py="xl">
      <Card
        padding="xl"
        radius="lg"
        withBorder
        pos="relative"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#d8d0c0",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
        }}
      >
        <LoadingOverlay
          visible={isLoading}
          overlayProps={{ radius: "lg", blur: 3, backgroundOpacity: 0.4 }}
          loaderProps={{ color: "forest", type: "dots", size: "lg" }}
        />

        {/* Cabeçalho da Seção de Login */}
        <Stack gap="xs" mb="lg" align="center" style={{ textAlign: "center" }}>
          <Group gap={6}>
            <Badge
              color="forest"
              variant="filled"
              size="sm"
              leftSection={<IconSparkles size={12} />}
            >
              Clube Nordic Nest
            </Badge>
          </Group>

          <Title
            order={1}
            style={{
              fontSize: "1.75rem",
              color: "#15120e",
              letterSpacing: "-0.5px",
              fontWeight: 800,
            }}
          >
            Acesso de Membro
          </Title>

          <Text
            size="xs"
            c="#6b5e4c"
            style={{ maxWidth: 360, lineHeight: 1.5 }}
          >
            Faça login para desbloquear os <strong>valores dos produtos</strong>
            , condições em até 10x sem juros e adicionar itens à sua{" "}
            <strong>sacola de compras</strong>.
          </Text>
        </Stack>

        {/* Alerta de Erro da API */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            title="Erro ao Entrar"
            color="red"
            variant="light"
            radius="md"
            mb="md"
            withCloseButton
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        {/* Formulário gerenciado por @mantine/form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="E-mail"
              description="E-mail cadastrado na plataforma"
              placeholder="ex: emily.johnson@x.dummyjson.com"
              leftSection={<IconMail size={18} stroke={1.5} color="#5b5047" />}
              radius="md"
              size="md"
              required
              key={form.key("email")}
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Senha"
              description="Sua senha secreta de acesso"
              placeholder="Sua senha"
              leftSection={<IconLock size={18} stroke={1.5} color="#5b5047" />}
              radius="md"
              size="md"
              required
              key={form.key("password")}
              {...form.getInputProps("password")}
            />

            <Group justify="space-between" mt={4}>
              <Checkbox
                label="Manter-me conectado"
                color="forest"
                size="xs"
                key={form.key("rememberMe")}
                {...form.getInputProps("rememberMe", { type: "checkbox" })}
              />
              <Text
                size="xs"
                c="#447c59"
                fw={600}
                style={{ cursor: "pointer" }}
              >
                Esqueceu a senha?
              </Text>
            </Group>

            <Button
              type="submit"
              color="forest"
              size="md"
              radius="md"
              fullWidth
              loading={isLoading}
              style={{
                backgroundColor: "#2d6a4f",
                boxShadow: "0 4px 14px rgba(45, 106, 79, 0.28)",
                fontWeight: 700,
                marginTop: 8,
              }}
              rightSection={<IconArrowRight size={18} />}
            >
              {isLoading ? "Autenticando..." : "Entrar na Conta"}
            </Button>
          </Stack>
        </form>

        <Divider
          my="lg"
          label="Credenciais de Demonstração Rápidas"
          labelPosition="center"
          color="#e9e4d8"
        />

        {/* Card de Credenciais Pré-preenchidas para Testes Rápidos */}
        <Box
          p="sm"
          style={{
            backgroundColor: "#f6f4ee",
            borderRadius: "10px",
            border: "1px solid #e0d8c8",
          }}
        >
          <Group gap="xs" mb={6}>
            <IconShieldCheck size={16} color="#2d6a4f" />
            <Text size="xs" fw={700} c="#1e3828">
              Contas de Teste Pré-Configuradas (Clique para preencher):
            </Text>
          </Group>

          <Stack gap={6}>
            <Button
              variant="default"
              size="xs"
              justify="flex-start"
              leftSection={<IconUser size={14} color="#447c59" />}
              onClick={() =>
                handleFillDemoUser(
                  "emily.johnson@x.dummyjson.com",
                  "emilyspass",
                )
              }
              style={{
                backgroundColor:
                  currentEmail === "emily.johnson@x.dummyjson.com"
                    ? "#e2ece4"
                    : "#ffffff",
                borderColor:
                  currentEmail === "emily.johnson@x.dummyjson.com"
                    ? "#447c59"
                    : "#d8d0c0",
                height: "auto",
                padding: "8px 12px",
              }}
            >
              <Stack gap={2} align="flex-start">
                <Text size="xs" fw={600}>
                  Emily Johnson (Designer Chefe)
                </Text>
                <Badge size="xs" color="forest" variant="light">
                  emily.johnson@x.dummyjson.com
                </Badge>
              </Stack>
            </Button>

            <Button
              variant="default"
              size="xs"
              justify="flex-start"
              leftSection={<IconUser size={14} color="#447c59" />}
              onClick={() =>
                handleFillDemoUser(
                  "michael.williams@x.dummyjson.com",
                  "michaelwpass",
                )
              }
              style={{
                backgroundColor:
                  currentEmail === "michael.williams@x.dummyjson.com"
                    ? "#e2ece4"
                    : "#ffffff",
                borderColor:
                  currentEmail === "michael.williams@x.dummyjson.com"
                    ? "#447c59"
                    : "#d8d0c0",
                height: "auto",
                padding: "8px 12px",
              }}
            >
              <Stack gap={2} align="flex-start">
                <Text size="xs" fw={600}>
                  Michael Williams
                </Text>
                <Badge size="xs" color="gray" variant="light">
                  michael.williams@x.dummyjson.com
                </Badge>
              </Stack>
            </Button>
          </Stack>
        </Box>
      </Card>
    </Container>
  );
};

export default LoginPage;
