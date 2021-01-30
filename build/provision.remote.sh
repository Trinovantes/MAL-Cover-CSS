#!/usr/bin/env sh

set -e

# -----------------------------------------------------------------------------
perl -E "print '-' x 80 . \"\n\""
echo 'Installing Requirements'
perl -E "print '-' x 80 . \"\n\""
# -----------------------------------------------------------------------------

apt-get update
snap install core
snap refresh core

# Nginx, Docker
apt-get install -y nginx docker.io

# Certbot
snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Enable services on system boot
systemctl enable nginx.service
systemctl enable docker.service
systemctl enable containerd.service

# -----------------------------------------------------------------------------
perl -E "print '-' x 80 . \"\n\""
echo 'Setting up Nginx'
perl -E "print '-' x 80 . \"\n\""
# -----------------------------------------------------------------------------

# Set up http (port 80)
echo "${NGINX_HTTP}" > /etc/nginx/conf.d/malcovercss.nginx.http.conf
rm -f /etc/nginx/conf.d/malcovercss.nginx.https.conf

# -----------------------------------------------------------------------------
perl -E "print '-' x 80 . \"\n\""
echo 'Running certbot'
perl -E "print '-' x 80 . \"\n\""
# -----------------------------------------------------------------------------

# Run certbot
# Cloudflare must have "Always use HTTPS" disabled
systemctl restart nginx
mkdir -p /var/www/letsencrypt
certbot -n -m devops@stephenli.ca --agree-tos certonly \
    --webroot -d malcovercss.link -d www.malcovercss.link \
    --webroot-path /var/www/letsencrypt || \
    certbot renew --dry-run

# Set up https (port 443)
echo "${NGINX_SSL}"   > /etc/nginx/snippets/malcovercss.nginx.ssl.conf
echo "${NGINX_HTTPS}" > /etc/nginx/conf.d/malcovercss.nginx.https.conf
systemctl restart nginx

# -----------------------------------------------------------------------------
perl -E "print '-' x 80 . \"\n\""
echo 'Seting up remote directories'
perl -E "print '-' x 80 . \"\n\""
# -----------------------------------------------------------------------------

mkdir -p /var/secrets/malcovercss/
mkdir -p /var/backups/malcovercss/
