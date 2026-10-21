import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';

export const vuetify = createVuetify({
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
    theme: {
        defaultTheme: 'warehouse',
        themes: {
            nexus: {
                dark: true,
                colors: { primary: '#14a44d', background: '#07110c', surface: '#0b1612', error: '#ffb4ab' },
            },
            warehouse: {
                dark: false,
                colors: { primary: '#14844c', background: '#f3faf5', surface: '#ffffff', error: '#b3261e' },
            },
        },
    },
});
