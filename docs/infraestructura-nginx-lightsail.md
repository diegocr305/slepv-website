# Infraestructura NGINX — Instancia AWS Lightsail (Bitnami)

Documentación de referencia de la configuración del servidor que aloja el sitio del SLEP Valparaíso. El objetivo es no tener que redescubrir esta información cada vez que se necesite tocar dominios, redirecciones o server blocks.

> **Última actualización:** septiembre 2026

---

## 1. Resumen del entorno

| Dato | Valor |
|------|-------|
| Proveedor | AWS Lightsail |
| Stack | Bitnami NGINX |
| Hostname interno | `ip-172-26-5-201` |
| Usuario SSH | `bitnami` |
| Web server | NGINX (binario en `/opt/bitnami/nginx/sbin/nginx`) |
| Root del sitio | `/opt/bitnami/nginx/html` |
| CDN / Proxy | **Cloudflare** (modo proxy activo — "naranja") |
| Dominio oficial | `https://slepvalparaiso.gob.cl` |
| Dominio redirigido | `https://slepvalparaiso.cl` → `.gob.cl` (301) |

**Importante sobre Cloudflare:** ambos dominios (`.cl` y `.gob.cl`) resuelven a IPs de Cloudflare (rangos `104.21.x.x` y `172.67.x.x`). El tráfico va: **Usuario → Cloudflare → NGINX (origin)**. Cloudflare habla **HTTPS (443)** con el origin, por eso cualquier redirección o server block relevante debe estar en `listen 443 ssl`, no solo en el puerto 80.

---

## 2. Estructura de archivos de configuración

```
/opt/bitnami/nginx/conf/
├── nginx.conf                      # Config principal
├── server_blocks/                  # ← AQUÍ viven todos los virtual hosts
│   ├── *.conf                      # Archivos ACTIVOS (se cargan)
│   └── *.conf.disabled             # Archivos INACTIVOS (nginx los ignora)
├── context.d/
│   ├── main/*.conf
│   ├── events/*.conf
│   └── http/*.conf
└── bitnami/*.conf
```

- `nginx.conf` incluye los server blocks con esta línea:
  ```nginx
  include "/opt/bitnami/nginx/conf/server_blocks/*.conf";
  ```
- **Solo cargan los archivos que terminan en `.conf`**. Para activar/desactivar un server block se renombra agregando o quitando el sufijo `.disabled`.
- Los server blocks cargan **en orden alfabético/numérico** (por eso el prefijo `00-`, `09-`, `10-`...). El orden importa cuando hay `server_name` que compiten.

---

## 3. Inventario de server blocks (septiembre 2026)

### Activos (`.conf`)

| Archivo | Dominio (server_name) | Función |
|---------|----------------------|---------|
| `00-default-ip.conf` | `slepvalparaiso.cl www.slepvalparaiso.cl` (puerto 80) | Default por IP |
| `09-slepv-cl-redirect.conf` | `slepvalparaiso.cl www.slepvalparaiso.cl` | **Redirect `.cl` → `.gob.cl`** (80 + 443) |
| `10-slepv-https.conf` | `slepvalparaiso.gob.cl www.slepvalparaiso.gob.cl` | **Sitio principal** (sirve `/opt/bitnami/nginx/html`) |
| `11-reservas-https.conf` | `reservas.slepvalparaiso.gob.cl` | App reservas |
| `12-reservas-cl-https-redirect.conf` | `reservas.slepvalparaiso.cl` | Redirect reservas `.cl` → `.gob.cl` |
| `13-repositorio-https.conf` | `repositorio.slepvalparaiso.cl` / `.gob.cl` | Repositorio |
| `14-matriculas-https.conf` | `matricula.slepvalparaiso.gob.cl` | Matrículas |
| `15-rgm-redirect.conf` | (redirect RGM) | Redirect |
| `16-oirs-https.conf` | `oirs.slepvalparaiso.gob.cl` | OIRS |
| `17-oirs-redirect.conf` | `oirs.slepvalparaiso.cl` | Redirect OIRS `.cl` → `.gob.cl` |

### Deshabilitados (`.conf.disabled`) — no cargan
`00-acme-only`, `00-default-ip` (variantes `.bak`/`.disabled`), `00-slepv-ip`, `01-acme-http`, `09-reservas-cl-redirect`, `reservas*.conf.disabled`, `sample-*`.

---

## 4. Certificados SSL (Let's Encrypt)

Los certificados se emiten vía Let's Encrypt y viven en:

```
/etc/letsencrypt/live/slepvalparaiso.cl-0001/fullchain.pem
/etc/letsencrypt/live/slepvalparaiso.cl-0001/privkey.pem
```

> **Nota:** el certificado `slepvalparaiso.cl-0001` cubre tanto `.cl` como `.gob.cl` (es un cert multi-dominio / SAN). Todos los server blocks HTTPS referencian este mismo par de archivos.

---

## 5. Patrón de un redirect de dominio `.cl` → `.gob.cl`

Este es el patrón probado y funcionando. Sirve de plantilla para cualquier subdominio nuevo.

```nginx
# Redirect <algo>.slepvalparaiso.cl -> <algo>.slepvalparaiso.gob.cl (HTTP + HTTPS)

# Bloque HTTP (puerto 80) — también deja pasar validación ACME
server {
    listen 80;
    server_name slepvalparaiso.cl www.slepvalparaiso.cl;

    location ^~ /.well-known/acme-challenge/ {
        root /opt/bitnami/nginx/html;
        default_type "text/plain";
        try_files $uri =404;
    }

    return 301 https://slepvalparaiso.gob.cl$request_uri;
}

# Bloque HTTPS (puerto 443) — EL IMPORTANTE porque Cloudflare habla HTTPS con el origin
server {
    listen 443 ssl;
    server_name slepvalparaiso.cl www.slepvalparaiso.cl;

    ssl_certificate     /etc/letsencrypt/live/slepvalparaiso.cl-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/slepvalparaiso.cl-0001/privkey.pem;

    # Redirección canónica al dominio oficial .gob.cl
    return 301 https://slepvalparaiso.gob.cl$request_uri;
}
```

---

## 6. Comandos de diagnóstico (chuleta)

### Ver la configuración y los server blocks

```bash
# Config principal completa
sudo cat /opt/bitnami/nginx/conf/nginx.conf

# Listar todos los server blocks (activos y deshabilitados)
sudo ls -la /opt/bitnami/nginx/conf/server_blocks/

# Ver un server block específico
sudo cat /opt/bitnami/nginx/conf/server_blocks/10-slepv-https.conf
```

### Buscar qué archivo maneja un dominio

```bash
# Todos los server_name que incluyan "slepvalparaiso" (solo activos)
sudo grep -rn "server_name" /opt/bitnami/nginx/conf/server_blocks/*.conf | grep -i "slepvalparaiso"

# Buscar un dominio EXACTO (ej. el dominio raíz)
sudo grep -rn "server_name" /opt/bitnami/nginx/conf/server_blocks/*.conf | grep -w "slepvalparaiso.cl"

# Qué bloques escuchan en 443
sudo grep -rn "listen.*443" /opt/bitnami/nginx/conf/server_blocks/*.conf
```

### Verificar comportamiento (redirecciones)

```bash
# ¿Qué responde NGINX directo (saltándose Cloudflare)? — usa Host header
curl -skI -H "Host: slepvalparaiso.cl" https://127.0.0.1/ | grep -i "http\|location\|server"

# ¿Qué responde a través de Cloudflare (lo que ve el usuario)?
curl -skI https://slepvalparaiso.cl/ | grep -i "http\|location\|server\|cf-ray"
```

Resultado esperado de la redirección (NGINX directo):
```
HTTP/1.1 301 Moved Permanently
Location: https://slepvalparaiso.gob.cl/
```

### Confirmar DNS (ambos deben resolver a IPs de Cloudflare)

```bash
nslookup slepvalparaiso.cl
nslookup slepvalparaiso.gob.cl
```

---

## 7. Procedimiento: activar / crear un redirect o server block

**Siempre** validar la sintaxis antes de recargar, y hacer backup antes de mover archivos.

```bash
# 1. Backup del archivo (si se va a modificar/activar uno existente)
sudo cp /opt/bitnami/nginx/conf/server_blocks/09-slepv-cl-redirect.conf.disabled ~/09-slepv-cl-redirect.backup

# 2. Activar un server block deshabilitado (quitar el sufijo .disabled)
sudo mv /opt/bitnami/nginx/conf/server_blocks/09-slepv-cl-redirect.conf.disabled \
        /opt/bitnami/nginx/conf/server_blocks/09-slepv-cl-redirect.conf

# 3. VALIDAR sintaxis ANTES de recargar  (paso obligatorio)
sudo /opt/bitnami/nginx/sbin/nginx -t

# 4. Si dice "test is successful", recargar NGINX
sudo /opt/bitnami/ctlscript.sh restart nginx

# 5. Verificar el resultado
curl -skI -H "Host: slepvalparaiso.cl" https://127.0.0.1/ | grep -i "http\|location"
```

**Para desactivar un server block:** el proceso inverso — renombrar agregando `.disabled` y recargar.

```bash
sudo mv /opt/bitnami/nginx/conf/server_blocks/XX-nombre.conf \
        /opt/bitnami/nginx/conf/server_blocks/XX-nombre.conf.disabled
sudo /opt/bitnami/nginx/sbin/nginx -t && sudo /opt/bitnami/ctlscript.sh restart nginx
```

---

## 8. Interpretar warnings comunes de `nginx -t`

```
nginx: [warn] conflicting server name "slepvalparaiso.cl" on 0.0.0.0:80, ignored
```

- Es un **warning, no un error**. nginx carga igual (`test is successful`).
- Significa que **dos server blocks declaran el mismo `server_name` en el mismo puerto**. nginx usa el primero que cargó e ignora el duplicado.
- En este entorno aparece en el **puerto 80** porque `00-default-ip.conf` y `09-slepv-cl-redirect.conf` ambos declaran `slepvalparaiso.cl`. No afecta la redirección porque **Cloudflare habla por 443**, y el bloque 443 no tiene conflicto.
- Si molesta, se puede quitar `slepvalparaiso.cl` del `server_name` del bloque default (`00-default-ip.conf`) — pero no es necesario para que funcione.

---

## 9. Comandos de gestión de NGINX (Bitnami)

```bash
# Validar configuración
sudo /opt/bitnami/nginx/sbin/nginx -t

# Reiniciar NGINX
sudo /opt/bitnami/ctlscript.sh restart nginx

# Estado de todos los servicios Bitnami
sudo /opt/bitnami/ctlscript.sh status

# Logs
sudo tail -f /opt/bitnami/nginx/logs/error.log
sudo tail -f /opt/bitnami/nginx/logs/access.log
```

---

## 10. Despliegue del sitio (recordatorio)

El despliegue es copia manual de `public/` al root de NGINX:

```bash
sudo cp -R ~/slepv-website/public/* /opt/bitnami/nginx/html/
sudo /opt/bitnami/ctlscript.sh restart nginx
```

---

## Historial de cambios

- **sep 2026** — Activado el redirect `slepvalparaiso.cl` → `slepvalparaiso.gob.cl` renombrando `09-slepv-cl-redirect.conf.disabled` a `.conf`. Verificado con `curl` directo a NGINX (`HTTP/1.1 301 → Location: https://slepvalparaiso.gob.cl/`).
