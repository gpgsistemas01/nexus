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
                colors: {
                    primary: '#14a44d',
                    background: '#07110c',
                    surface: '#0b1612',
                    error: '#ffb4ab',
                },
            },
            warehouse: {
                dark: false,
                colors: {
                    primary: '#107c41',
                    'on-primary': '#ffffff',
                    background: '#f8fbf8',
                    surface: '#ffffff',
                    'on-surface': '#332d2d',
                    error: '#b3261e',
                    muted: '#59675e',
                    'table-header': '#107c41',
                    'table-border': '#a9d08e',
                    'table-alt': '#f3fbf6',
                    'table-hover': '#e2f0d9',
                    'filter-action': '#1f4e79',
                    'filter-clear': '#5f6368',
                },
            },
        },
    },
});
