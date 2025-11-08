-- Script SQL para actualizar los campos image y banner a TEXT
-- Ejecuta este script directamente en tu base de datos MySQL

-- Actualizar campo image a TEXT
ALTER TABLE `User` MODIFY COLUMN `image` TEXT;

-- Actualizar campo banner a TEXT  
ALTER TABLE `User` MODIFY COLUMN `banner` TEXT;

