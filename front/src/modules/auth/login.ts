export interface LoginCredentials {
    name: string;
    password: string;
}

export type LoginField = keyof LoginCredentials;
export type LoginFieldErrors = Partial<Record<LoginField, string>>;

export interface LoginFormProps extends LoginCredentials {
    errors: LoginFieldErrors;
    isPasswordVisible: boolean;
    shouldRememberUser: boolean;
    isSubmitting: boolean;
    message: string;
}

export interface LoginFormEmits {
    'update:name': [name: string];
    'update:password': [password: string];
    'update:shouldRememberUser': [shouldRememberUser: boolean];
    blur: [field: LoginField];
    togglePassword: [];
    submit: [];
}
