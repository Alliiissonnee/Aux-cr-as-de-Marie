# Ce fichier, lui, ne concerne qu'un seul des 3 services : php. 
# Il répond à un problème précis qu'on a rencontré : l'image PHP de base ne sait pas parler à MySQL, 
# il lui manquait une extension (pdo_mysql).

# Le Dockerfile dit simplement : "pars de l'image PHP standard, puis ajoute cette extension avant de considérer l'image comme prête." 
# C'est comme une recette de cuisine en 2 étapes : ingrédient de base + un ajout. 
# Docker Compose utilise ensuite ce Dockerfile (via build: .) pour construire une version personnalisée de PHP, 
# au lieu d'utiliser l'image brute non modifiée.


FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql

RUN echo "upload_max_filesize = 10M" > /usr/local/etc/php/conf.d/uploads.ini \
 && echo "post_max_size = 12M" >> /usr/local/etc/php/conf.d/uploads.ini

# Les alertes de PHP sont écrites dans les logs (docker logs creas_php) au lieu d'être affichées dans la page :
# un visiteur ne doit jamais voir les messages techniques de PHP.
RUN echo "display_errors = Off" > /usr/local/etc/php/conf.d/errors.ini \
 && echo "log_errors = On" >> /usr/local/etc/php/conf.d/errors.ini

# Composer : le "magasin" de bibliothèques PHP. On l'utilise pour installer PHPMailer (envoi d'emails).
# Les bibliothèques sont installées dans /var/www/vendor, en dehors du site (/var/www/html) :
# elles ne sont donc pas accessibles depuis le navigateur.
RUN apt-get update && apt-get install -y --no-install-recommends unzip && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --optimize-autoloader
WORKDIR /var/www/html
