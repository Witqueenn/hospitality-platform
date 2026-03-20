-- PostgreSQL init script: ilk başlatmada çalışır
-- Umami için ayrı bir veritabanı oluşturur (hospitality_platform ile aynı sunucuda)

SELECT 'CREATE DATABASE umami OWNER ' || current_user
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'umami')\gexec
