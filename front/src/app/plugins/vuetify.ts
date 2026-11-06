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
                variables: {
                    'high-emphasis-opacity': 1,
                    'medium-emphasis-opacity': 0.9,
                },
                colors: {
                    primary: '#107c41',
                    'on-primary': '#ffffff',
                    background: '#dfe8e2',
                    surface: '#eaf0eb',
                    'on-surface': '#1f3028',
                    'control-surface': '#f1f5f0',
                    'control-readonly': '#dce7df',
                    'control-disabled': '#d3dfd6',
                    error: '#b3261e',
                    muted: '#40564a',
                    'modal-header': '#332d2d',
                    accent: '#fca311',
                    'on-accent': '#332d2d',
                    'menu-surface': '#101714',
                    'menu-text': '#fbfbfb',
                    'menu-accent': '#38bdf8',
                    'table-header': '#0d6838',
                    'table-header-top': '#147749',
                    'table-header-hover': '#0b5f2a',
                    'table-child-header': '#fff3d9',
                    'table-child-text': '#332d2d',
                    'table-child-border': '#d88500',
                    'table-border': '#92ac9a',
                    'table-alt': '#e0eae2',
                    'table-hover': '#d1e2d5',
                    'table-stock-warning': '#f3e1b3',
                    'filter-action': '#1f4e79',
                    'filter-clear': '#5f6368',
                },
            },
        },
    },
});
