import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, Text, Button, Stack, Box } from '@mantine/core';
import { IconHome, IconMoodEmpty } from '@tabler/icons-react';

export const NotFoundPage: React.FC = () => {
  return (
    <Container size="sm" py={80} style={{ textAlign: 'center' }}>
      <Stack align="center" gap="md">
        <Box
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#deebe2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#447c59',
          }}
        >
          <IconMoodEmpty size={40} />
        </Box>
        <Text size="xl" fw={700} c="#447c59">
          404
        </Text>
        <Title order={1} c="#222528">
          Página não encontrada
        </Title>
        <Text size="sm" c="#786b5f" style={{ maxWidth: 420 }}>
          O item ou ambiente que você estava procurando não existe ou foi reorganizado no acervo.
        </Text>
        <Button
          component={Link}
          to="/"
          color="forest"
          size="md"
          mt="md"
          leftSection={<IconHome size={18} />}
        >
          Voltar para a Página Inicial
        </Button>
      </Stack>
    </Container>
  );
};
