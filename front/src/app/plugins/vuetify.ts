import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import 'vuetify/styles';
import '../../shared/ui/warehouse.css';

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
                    'modal-header': '#332d2d',
                    accent: '#fca311',
                    'on-accent': '#332d2d',
                    'menu-surface': '#101714',
                    'menu-text': '#fbfbfb',
                    'menu-accent': '#38bdf8',
                    'table-header': '#107c41',
                    'table-header-top': '#16875b',
                    'table-header-hover': '#0b5f2a',
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
