#!/bin/sh
set -eu
trap 'exit 0' INT TERM

while :; do
    php bin/console.php publish
    php bin/console.php cleanup
    sleep 60 &
    wait "$!"
done
