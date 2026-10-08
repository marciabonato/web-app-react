import React from 'react';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MantineProvider>
  );
};

export default App;
