Guía para Actualizar el Sitio Web en el Servidor Bitnami (NGINX)
================================================================

1. Ir al directorio raíz del usuario:
-------------------------------------
cd ~

2. Eliminar contenido anterior:
-------------------------------
Eliminar archivos del sitio web anterior en NGINX:
sudo rm -rf /opt/bitnami/nginx/html/*

Eliminar versión antigua del proyecto:
rm -rf ~/slepv-website

3. Clonar el repositorio desde GitHub:
--------------------------------------
git clone https://github.com/diegocr305/slepv-website.git

4. Entrar al proyecto clonado:
------------------------------
cd ~/slepv-website

(En caso de que el proyecto ya exista, solo hacer pull:)
git pull origin main

5. Copiar contenido nuevo al servidor NGINX:
--------------------------------------------
sudo cp -R ~/slepv-website/public/* /opt/bitnami/nginx/html/

6. Reiniciar NGINX para aplicar cambios:
----------------------------------------
sudo /opt/bitnami/ctlscript.sh restart nginx

7. Verifica el sitio:
---------------------
https://slepvalparaiso.cl
