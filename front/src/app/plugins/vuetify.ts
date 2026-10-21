import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';

export const vuetify = createVuetify({
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
    theme: {
        defaultTheme: 'preview',
        themes: {
            nexus: {
                dark: true,
                colors: { primary: '#14a44d', background: '#07110c', surface: '#0b1612', error: '#ffb4ab' },
            },
            preview: {
                dark: false,
                colors: { primary: '#6750a4', background: '#f6f7fb', surface: '#ffffff' },
            },
        },
    },
});
