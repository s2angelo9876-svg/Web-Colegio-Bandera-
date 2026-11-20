FROM php:8.4-cli-bookworm
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libjpeg62-turbo-dev libpng-dev libwebp-dev qpdf \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql gd exif \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
