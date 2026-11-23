#!/bin/sh
# Install the extensions shared by the development, VPS, and Railway images.
set -eu

apt-get update
apt-get install -y --no-install-recommends libpq-dev libjpeg62-turbo-dev libpng-dev libwebp-dev libonig-dev qpdf "$@"
docker-php-ext-configure gd --with-jpeg --with-webp
docker-php-ext-install -j"$(nproc)" pdo_pgsql gd exif mbstring
rm -rf /var/lib/apt/lists/*
