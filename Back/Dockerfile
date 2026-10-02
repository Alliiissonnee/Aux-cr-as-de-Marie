# Ce fichier, lui, ne concerne qu'un seul des 3 services : php. 
# Il répond à un problème précis qu'on a rencontré : l'image PHP de base ne sait pas parler à MySQL, 
# il lui manquait une extension (pdo_mysql).

# Le Dockerfile dit simplement : "pars de l'image PHP standard, puis ajoute cette extension avant de considérer l'image comme prête." 
# C'est comme une recette de cuisine en 2 étapes : ingrédient de base + un ajout. 
# Docker Compose utilise ensuite ce Dockerfile (via build: .) pour construire une version personnalisée de PHP, 
# au lieu d'utiliser l'image brute non modifiée.


FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql