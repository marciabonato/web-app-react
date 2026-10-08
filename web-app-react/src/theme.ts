import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Paleta verde botânico / escandinavo: vibrante, acolhedor, com alto contraste
const nordicForest: MantineColorsTuple = [
  '#f0f7f3', // 0: tint suave de fundo
  '#dbeef2', // 1: tint claro
  '#b7dec6', // 2: borda suave
  '#8ecaa5', // 3: elementos secundários
  '#65b283', // 4: destaque médio
  '#439665', // 5: verde folha nórdico
  '#2d6a4f', // 6: cor primária marcante e legível
  '#1e4632', // 7: hover do botão primário (mudança de cor bem perceptível)
  '#143323', // 8: tom escuro profundo
  '#0b1f15', // 9: preto botânico
];

// Neutros quentes: linho, areia e off-white nórdico com contraste tipográfico alto
const warmNeutral: MantineColorsTuple = [
  '#fcfbf9', // 0: off-white principal de fundo
  '#f6f4ee', // 1: superfície de cartões
  '#e9e4d8', // 2: divisores
  '#d8d0c0', // 3: bordas de cartões
  '#b3a793', // 4: texto secundário
  '#8f816c', // 5: rótulos
  '#6b5e4c', // 6: apoio
  '#483e32', // 7: texto corpo (escuro e nítido)
  '#2a241c', // 8: títulos escuros
  '#15120e', // 9: noir linho
];

// Cinzas escuros texturizados: ardósia e grafite mineral
const charcoal: MantineColorsTuple = [
  '#f7f7f8',
  '#eeeff0',
  '#dbdcde',
  '#b9bbbe',
  '#93969b',
  '#6e7279',
  '#4e5259',
  '#35383f',
  '#1f2228',
  '#111317',
];

// Ponto de cor vibrante com personalidade: terracota / âmbar queimado
const terracotta: MantineColorsTuple = [
  '#fef5f0',
  '#fce7dc',
  '#f9cdb8',
  '#f4ab8e',
  '#ee8762',
  '#e86538', // 5: terracota vibrante
  '#cb4b20', // 6: destaque elegante
  '#a33714',
  '#7b270c',
  '#561a06',
];

export const theme = createTheme({
  primaryColor: 'forest',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    forest: nordicForest,
    neutral: warmNeutral,
    charcoal,
    terracotta,
  },
  fontFamily:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headings: {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.25' },
      h3: { fontSize: '1.5rem', lineHeight: '1.3' },
      h4: { fontSize: '1.25rem', lineHeight: '1.35' },
    },
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  other: {
    brandOffWhite: '#FCFBF9',
    brandSurface: '#FFFFFF',
    brandTextPrimary: '#15120E',
    brandTextMuted: '#483E32',
    brandBorder: '#D8D0C0',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        fw: 600,
      },
      styles: {
        root: {
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            filter: 'brightness(0.92)',
          },
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        padding: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: '#FFFFFF',
          borderColor: '#D8D0C0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
          transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -4px rgba(45, 106, 79, 0.14), 0 4px 8px -2px rgba(0, 0, 0, 0.05)',
            borderColor: '#2d6a4f',
          },
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
        fw: 700,
      },
    },
    Pagination: {
      defaultProps: {
        color: 'forest',
        radius: 'md',
        size: 'md',
      },
      styles: {
        control: {
          fontWeight: 600,
          transition: 'all 160ms ease',
          '&[data-active]': {
            backgroundColor: '#2d6a4f',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(45, 106, 79, 0.3)',
          },
          '&:hover:not([data-active])': {
            backgroundColor: '#dbeef2',
            color: '#1e4632',
          },
        },
      },
    },
  },
});
