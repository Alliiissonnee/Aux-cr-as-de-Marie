-- Structure de la base : crée les tables nécessaires au site.
-- Ce fichier est exécuté automatiquement par MySQL au tout premier démarrage (volume vide),
-- grâce au montage dans /docker-entrypoint-initdb.d (voir docker-compose.yml).
-- Il ne contient aucune donnée sensible : le compte admin se crée à part (voir docs/create_admin.txt).

USE auxcreasdemarie;

-- Les créations affichées dans la galerie.
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Les comptes autorisés à se connecter à l'administration.
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
