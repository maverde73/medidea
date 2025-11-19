-- Create admin user for production
-- Password: admin123 (hash generato con bcrypt, 10 rounds)
-- IMPORTANTE: Cambiare la password dopo il primo login!

INSERT INTO users (email, password_hash, nome, cognome, role, active)
VALUES (
  'admin@medidea.local',
  '$2b$10$OBed4U5KmQaFiPoONzgH3ea3JJYZqiPBQORPs4DCI0INiaM1JtU4y',
  'Admin',
  'System',
  'admin',
  1
);
