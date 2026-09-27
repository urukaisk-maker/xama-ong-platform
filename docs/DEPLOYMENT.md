# 🚢 Guía de despliegue

## Requisitos previos

- Un **VPS** (recomendado: Hetzner CX22, ~5€/mes)
- Un **dominio** (~10€/año en Cloudflare Registrar o Namecheap)
- Conocimientos básicos de SSH

## Opción 1 — Despliegue en VPS (recomendado)

### Paso 1: Contratar VPS

**Hetzner Cloud** (~5€/mes):

- CX22: 2 vCPU, 4 GB RAM, 40 GB SSD
- OS: Ubuntu 24.04
- Añade tu clave SSH al crear el servidor

### Paso 2: Configurar servidor

    # Conectar por SSH
    ssh root@tu-ip

    # Actualizar
    apt update && apt upgrade -y

    # Instalar Docker
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker

    # Crear usuario no-root
    adduser xama
    usermod -aG docker,sudo xama
    su - xama

### Paso 3: Clonar el proyecto

    git clone https://github.com/urukaisk-maker/xama-ong-platform.git
    cd xama-ong-platform
    cp .env.example .env
    nano .env  # Configurar SECRET_KEY y POSTGRES_PASSWORD

### Paso 4: Arrancar

    docker compose up -d
    docker compose exec xama-api alembic upgrade head

### Paso 5: Dominio + HTTPS con Cloudflare Tunnel

**Instalar cloudflared:**

    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
      -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared

**Autenticar:**

    cloudflared tunnel login
    # Sigue las instrucciones en el navegador

**Crear túnel:**

    cloudflared tunnel create xama
    # Guarda el UUID que te devuelve

**Configurar ~/.cloudflared/config.yml:**

    tunnel: <UUID>
    credentials-file: /home/xama/.cloudflared/<UUID>.json

    ingress:
      - hostname: app.xamaong.cat
        service: http://localhost:3100
      - hostname: api.xamaong.cat
        service: http://localhost:8100
      - hostname: xamaong.cat
        service: http://localhost:3100
      - service: http_status:404

**Configurar DNS en Cloudflare:**

    cloudflared tunnel route dns xama app.xamaong.cat
    cloudflared tunnel route dns xama api.xamaong.cat
    cloudflared tunnel route dns xama xamaong.cat

**Instalar como servicio:**

    sudo cloudflared service install
    sudo systemctl enable --now cloudflared

**Actualizar docker-compose.yml** con las URLs reales:

    environment:
      NEXT_PUBLIC_API_URL: "https://api.xamaong.cat"
      NEXT_PUBLIC_SITE_URL: "https://app.xamaong.cat"
      API_INTERNAL_URL: "http://xama-api:8000"

Y reconstruir:

    docker compose up -d --force-recreate xama-web

### Paso 6: Backups automáticos

El script ya está en scripts/backup.sh. Programar con cron:

    crontab -e

Añadir:

    0 3 * * * /bin/bash /home/xama/xama-ong-platform/scripts/backup.sh >> /home/xama/xama-ong-platform/backups/backup.log 2>&1

### Paso 7: Monitorización

**Uptime Kuma** (opcional):

    docker run -d \
      --name uptime-kuma \
      --restart=unless-stopped \
      -p 3001:3001 \
      -v uptime-kuma:/app/data \
      louislam/uptime-kuma:1

Accede a http://tu-ip:3001 y añade monitores para:

- https://app.xamaong.cat (HTTP)
- https://api.xamaong.cat/health (HTTP)

## Opción 2 — Railway + Vercel (sin VPS)

Si no quieres gestionar un VPS:

**Backend + DB en Railway** (~5€/mes):

1. Crea cuenta en railway.app
2. New Project → Deploy from GitHub
3. Añade un plugin PostgreSQL
4. Configura variables de entorno
5. Railway te da una URL xxx.railway.app

**Frontend en Vercel** (gratis):

1. Crea cuenta en vercel.com
2. Import Git Repository → selecciona el repo
3. Root Directory: frontend
4. Variable: NEXT_PUBLIC_API_URL=https://tu-url.railway.app
5. Deploy

## Opción 3 — Solo local + túnel (0€)

Perfecto para demos y pruebas:

    # Terminal 1: arrancar Docker
    docker compose up -d

    # Terminal 2: túnel del backend
    cloudflared tunnel --url http://localhost:8100

    # Terminal 3: túnel del frontend
    cloudflared tunnel --url http://localhost:3100

**Limitación:** si cierras la terminal, la web se cae.

## Actualizar el despliegue

    cd xama-ong-platform
    git pull
    docker compose build
    docker compose up -d
    docker compose exec xama-api alembic upgrade head

## Restaurar un backup

    bash scripts/restore.sh backups/daily/xama_20260927_030000.sql.gz

Te pedirá confirmación antes de sobreescribir la DB.

## Troubleshooting

### El contenedor no arranca

    docker compose logs xama-api
    docker compose logs xama-web

### La DB no responde

    docker compose exec xama-db pg_isready -U xama_user

### El backup falla

Verifica permisos:

    chmod +x scripts/backup.sh

### El frontend no conecta con el backend

Verifica NEXT_PUBLIC_API_URL en .env y reinicia:

    docker compose restart xama-web

---

**Última actualización:** 27 de septiembre de 2026
