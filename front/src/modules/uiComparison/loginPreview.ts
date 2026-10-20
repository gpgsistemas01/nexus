export type LoginLibrary = 'mdb' | 'vuetify' | 'primevue';

export const LOGIN_LIBRARIES = [
  { id: 'mdb', name: 'MDB Vue', eyebrow: 'CONTINUIDAD VISUAL', description: 'La opción más cercana al diseño Bootstrap y MDB del sistema actual.', detail: 'Contornos finos, campos flotantes y botones con sombra.', color: '#3b71ca' },
  { id: 'vuetify', name: 'Vuetify', eyebrow: 'MATERIAL DESIGN', description: 'Una interfaz Material con componentes y estados visuales consistentes.', detail: 'Campos con superficie, espaciado amplio y botones redondeados.', color: '#6750a4' },
  { id: 'primevue', name: 'PrimeVue', eyebrow: 'APLICACIONES DE DATOS', description: 'Una biblioteca de controles para formularios y módulos administrativos.', detail: 'Campos delineados, foco destacado y controles compactos.', color: '#047857' },
] as const;

export interface LoginPreviewProps {
  name: string;
  password: string;
  showPassword: boolean;
  errors: { name: string; password: string };
  feedback: string;
}

export type LoginPreviewEmits = {
  name: [value: string];
  password: [value: string];
  togglePassword: [];
  submit: [];
};
