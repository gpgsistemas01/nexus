import { createVuetify } from 'vuetify';
import 'vuetify/styles';

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'preview',
    themes: {
      preview: {
        dark: false,
        colors: { primary: '#6750a4', background: '#f6f7fb', surface: '#ffffff' },
      },
    },
  },
});
