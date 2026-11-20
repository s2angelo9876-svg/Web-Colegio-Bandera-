ARG PHP_VARIANT=cli
FROM php:8.4-${PHP_VARIANT}-bookworm AS php-runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libjpeg62-turbo-dev libpng-dev libwebp-dev qpdf \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql gd exif \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM php-runtime AS vps-php
COPY bin/console.php /app/bin/
COPY migrations/ /app/migrations/
COPY public/ /app/public/
COPY src/ /app/src/
COPY deploy/vps/database-grants.php deploy/vps/worker.sh /app/deploy/vps/
COPY --chmod=0644 deploy/vps/php.ini /usr/local/etc/php/conf.d/50-vps.ini
COPY --chmod=0644 deploy/vps/php-fpm.conf /usr/local/etc/php-fpm.d/zz-vps.conf
RUN chmod -R a=rX /app
USER www-data
CMD ["php-fpm"]

FROM caddy:2-alpine AS vps-edge
RUN setcap -r /usr/bin/caddy && chown 10001:10001 /data /config
COPY --chmod=0644 deploy/vps/Caddyfile /etc/caddy/Caddyfile
COPY public/assets/ /srv/public/assets/
COPY public/images/ /srv/public/images/
COPY public/*.css public/*.js /srv/public/
RUN chmod -R a=rX /srv/public
USER 10001:10001

FROM php-runtime AS development
