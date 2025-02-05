'use client';
import { extendTheme, Heading, withDefaultColorScheme } from '@chakra-ui/react';
import { theme } from '@saas-ui/react';
import { mode } from '@chakra-ui/theme-tools';

import components from './components';
import { fontSizes } from './foundations/typography';
const styles = {
  global: (props: any) => ({
    body: {
      color: 'gray.900',
      bg: '#f5f4f2',
      fontSize: 'lg',
      _dark: {
        color: '#e6e6e6',
        bg: 'black',
      },
      _light: {
        color: 'gray.100',
        bg: '#ffffff30',
      },
    },
    _placeholder: {
      color: 'gray.600',
    },
  }),
};

const newComponents = {
  ...components,
  Button: {
    variants: {
      'nav-link': {
        color: 'gray.900',
        _dark: {
          color: '#e6e6e6',
        },
        _light: {
          color: 'gray.100',
        },
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
  Heading: {
    baseStyle: (props: any) => ({
      color: mode('gray.100', '#e6e6e6')(props),
    }),
  },
};

export default extendTheme(
  {
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    styles,
    fontSizes,
    components: newComponents,
  },
  theme
);
