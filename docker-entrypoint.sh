#!/bin/sh

set -eu

# Esta imagen es exclusivamente de producción. No se permite que una variable
# NODE_ENV inyectada al contenedor desvíe Prisma o la app a URLs de pruebas.
export NODE_ENV=production

case "${RUN_MIGRATIONS:-true}" in
  true)
    if [ -z "${DIRECT_URL:-}" ]; then
      echo "No se pueden ejecutar migraciones: DIRECT_URL no está definida." >&2
      echo "DATABASE_URL se reserva para la aplicación y no se usará como conexión directa implícita." >&2
      exit 1
    fi

    echo "Iniciando migraciones Prisma con DIRECT_URL (las credenciales no se muestran)."
    # prisma.config.ts selecciona DIRECT_URL para las operaciones del CLI y
    # conserva DATABASE_URL (por ejemplo, una URL con pooler) para la app.
    ./node_modules/.bin/prisma migrate deploy
    echo "Migraciones Prisma verificadas correctamente."
    ;;
  false)
    echo "Migraciones omitidas porque RUN_MIGRATIONS=false."
    ;;
  *)
    echo "RUN_MIGRATIONS debe ser 'true' o 'false'." >&2
    exit 1
    ;;
esac

exec "$@"
