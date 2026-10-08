import React from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  ThemeIcon,
  Stack,
  Box,
} from "@mantine/core";
import {
  IconPalette,
  IconTrees,
  IconSunHigh,
  IconHeartHandshake,
} from "@tabler/icons-react";

export const AboutPage: React.FC = () => {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Box style={{ textAlign: "center" }}>
          <Text
            size="xs"
            fw={700}
            c="#447c59"
            style={{ textTransform: "uppercase", letterSpacing: "1px" }}
          >
            Nossa Visão & Essência
          </Text>
          <Title order={1} mt="xs" c="#222528" style={{ fontSize: "2.5rem" }}>
            O Conceito Nórdico de Bem-Estar
          </Title>
          <Text
            size="md"
            c="#5b5047"
            mt="md"
            style={{ maxWidth: 600, marginInline: "auto", lineHeight: 1.6 }}
          >
            O design escandinavo não é apenas um estilo estético, é uma
            filosofia que une funcionalidade, materiais nobres e o calor do lar
            (Hygge).
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
          <Card
            p="xl"
            radius="lg"
            withBorder
            style={{ backgroundColor: "#ffffff", borderColor: "#e8e3d8" }}
          >
            <ThemeIcon
              size={46}
              radius="md"
              color="forest"
              variant="light"
              mb="md"
            >
              <IconTrees size={24} />
            </ThemeIcon>
            <Title order={3} size="h4" c="#222528" mb="xs">
              Conexão com a Natureza
            </Title>
            <Text size="sm" c="#786b5f" style={{ lineHeight: 1.6 }}>
              Priorizamos madeiras claras, palhas trançadas, linho cru e tons de
              verde que transportam a serenidade das florestas boreais para o
              ambiente interno.
            </Text>
          </Card>

          <Card
            p="xl"
            radius="lg"
            withBorder
            style={{ backgroundColor: "#ffffff", borderColor: "#e8e3d8" }}
          >
            <ThemeIcon
              size={46}
              radius="md"
              color="forest"
              variant="light"
              mb="md"
            >
              <IconSunHigh size={24} />
            </ThemeIcon>
            <Title order={3} size="h4" c="#222528" mb="xs">
              Aproveitamento de Luz
            </Title>
            <Text size="sm" c="#786b5f" style={{ lineHeight: 1.6 }}>
              Espaços abertos, linhas limpas e cores suaves maximizam a
              luminosidade natural e proporcionam sensação de amplitude e
              tranquilidade.
            </Text>
          </Card>

          <Card
            p="xl"
            radius="lg"
            withBorder
            style={{ backgroundColor: "#ffffff", borderColor: "#e8e3d8" }}
          >
            <ThemeIcon
              size={46}
              radius="md"
              color="forest"
              variant="light"
              mb="md"
            >
              <IconPalette size={24} />
            </ThemeIcon>
            <Title order={3} size="h4" c="#222528" mb="xs">
              Minimalismo Funcional
            </Title>
            <Text size="sm" c="#786b5f" style={{ lineHeight: 1.6 }}>
              Menos ruído visual e mais significado. Cada peça cumpre um
              propósito prático enquanto eleva a composição estética do espaço.
            </Text>
          </Card>

          <Card
            p="xl"
            radius="lg"
            withBorder
            style={{ backgroundColor: "#ffffff", borderColor: "#e8e3d8" }}
          >
            <ThemeIcon
              size={46}
              radius="md"
              color="forest"
              variant="light"
              mb="md"
            >
              <IconHeartHandshake size={24} />
            </ThemeIcon>
            <Title order={3} size="h4" c="#222528" mb="xs">
              Acolhimento & Afeto
            </Title>
            <Text size="sm" c="#786b5f" style={{ lineHeight: 1.6 }}>
              A casa deve ser um refúgio acolhedor. Nossos produtos são
              desenhados para acolher encontros e momentos de introspecção.
            </Text>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
};
