import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Algunas suites comprueban llamadas hechas al registrar las rutas.
        // Vitest 5 limpia mocks por defecto; se conserva el contrato previo.
        clearMocks: false,
        include: ['tests/**/*Test.js'],
        exclude: ['tests/integration/**'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.js'],
            reporter: ['text-summary', 'html', 'lcov', 'json-summary'],
            reportsDirectory: 'coverage/unit',
            reportOnFailure: true
        }
    }
});
