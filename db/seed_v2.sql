-- Seed data v2 (Refactored Schema)

-- 1. Users
INSERT INTO utenti (email, password_hash, nome, cognome, role, active) VALUES
('admin@medidea.local', '$2b$10$A4hMvRIfiFR2kL.q/q1sMef6r9jEINnlInXZ8UlaIO0U9Z6SWmBLi', 'Admin', 'User', 'admin', 1),
('tecnico1@medidea.local', '$2b$10$A4hMvRIfiFR2kL.q/q1sMef6r9jEINnlInXZ8UlaIO0U9Z6SWmBLi', 'Mario', 'Rossi', 'tecnico', 1),
('tecnico2@medidea.local', '$2b$10$A4hMvRIfiFR2kL.q/q1sMef6r9jEINnlInXZ8UlaIO0U9Z6SWmBLi', 'Giuseppe', 'Verdi', 'tecnico', 1);

INSERT INTO tecnici (nome, cognome, id_utente) VALUES
('Mario', 'Rossi', 2),
('Giuseppe', 'Verdi', 3);

-- 2. Clients
INSERT INTO clienti (nome, indirizzo, contatti) VALUES
('Ospedale San Raffaele', 'Via Olgettina 60, Milano', 'info@sanraffaele.it, Tel: 02-26431'),
('Clinica Villa Maria', 'Corso Italia 23, Roma', 'info@villamaria.it, Tel: 06-12345678'),
('Poliambulatorio Central Medical', 'Via Garibaldi 15, Torino', 'info@centralmed.it, Tel: 011-987654'),
('Ospedale Maggiore', 'Piazza Ospedale 1, Bologna', 'contatti@maggiore.bo.it, Tel: 051-223344'),
('Casa di Cura Villa Aurora', 'Via Aurora 12, Firenze', 'info@villaaurora.it, Tel: 055-556677'),
('Clinica San Carlo', 'Viale San Carlo 45, Padova', 'info@sancarlo.pd.it, Tel: 049-778899'),
('Centro Diagnostico Gamma', 'Via Dante 78, Genova', 'gamma@diagnostici.ge.it, Tel: 010-334455'),
('Poliambulatorio Salus', 'Corso Venezia 34, Verona', 'info@salus.vr.it, Tel: 045-667788'),
('Clinica Santa Rita', 'Via Roma 89, Napoli', 'santarita@napoli.it, Tel: 081-445566'),
('Ospedale Civile', 'Piazza Civica 5, Brescia', 'info@civile.bs.it, Tel: 030-112233'),
('Centro Medico Leonardo', 'Via Leonardo 56, Pisa', 'leonardo@medico.pi.it, Tel: 050-998877'),
('Clinica Montefiore', 'Viale Montefiore 23, Trieste', 'info@montefiore.ts.it, Tel: 040-556644');

-- 3. Models
-- Extracted distinct models from original seed
INSERT INTO modelli_apparecchiature (nome, descrizione) VALUES
('Ecografo ECO-PRO', 'Ecografo professionale per cardiologia'),
('TAC Scanner TAC-3000', 'Scanner TAC multi-slice'),
('Radiografo RX-Digital', 'Radiografo digitale portatile'),
('Monitor Paziente MP-500', 'Monitor multiparametrico'),
('Defibrillatore DEF-AED', 'Defibrillatore semiautomatico'),
('Ventilatore VENT-2000', 'Ventilatore polmonare ICU'),
('Elettrocardiografo ECG-12', 'ECG a 12 derivazioni'),
('Ecografo ECO-BASIC', 'Ecografo base per medicina generale'),
('Centrifuga LAB-C500', 'Centrifuga da laboratorio'),
('Analizzatore ANALY-3000', 'Analizzatore ematologico'),
('Sterilizzatore STER-AUTO', 'Sterilizzatore automatico'),
('Mammografo MAMMO-DIG', 'Mammografo digitale'),
('Laser Chirurgico LASER-X', 'Laser per chirurgia oftalmica'),
('Ecografo ECO-CARD', 'Ecografo cardiologico avanzato'),
('Monitor Fetale FET-200', 'Monitor per controllo fetale'),
('Pompa Infusione PUMP-AUTO', 'Pompa infusione automatica'),
('Aspiratore ASP-SURG', 'Aspiratore chirurgico'),
('Termometro THERM-IR', 'Termometro infrarossi'),
('Elettrocardiografo ECG-300', 'Elettrocardiografo portatile'),
('Monitor Paziente MP-200', 'Monitor paziente base'),
('Defibrillatore DEF-500', 'Defibrillatore ospedaliero');

-- 4. Equipment (Apparecchiature)
-- Mapping based on original seed, connecting to Model IDs (assuming sequential IDs from above insert)
-- 1: Ecografo ECO-PRO
-- 2: TAC Scanner TAC-3000
-- 3: Radiografo RX-Digital
-- ...
INSERT INTO apparecchiature (id_cliente, id_modello, seriale, data_test_funzionali, data_test_elettrici, note) VALUES
(1, 1, 'SN2023-ECO-001', '2025-10-15', '2025-10-14', 'Ecografo professionale per cardiologia'),
(2, 2, 'SN2023-TAC-002', '2025-09-20', '2025-09-19', 'Scanner TAC multi-slice'),
(3, 3, 'SN2024-RX-001', '2025-11-01', '2025-10-31', 'Radiografo digitale portatile'),
(1, 4, 'SN2024-MON-001', '2025-11-05', '2025-11-04', 'Monitor multiparametrico'),
(4, 5, 'SN2024-DEF-002', '2025-10-20', '2025-10-19', 'Defibrillatore semiautomatico'),
(5, 6, 'SN2023-VENT-001', '2025-09-15', '2025-09-14', 'Ventilatore polmonare ICU'),
(6, 7, 'SN2024-ECG-003', '2025-11-10', '2025-11-09', 'ECG a 12 derivazioni'),
(2, 8, 'SN2023-ECO-005', '2025-08-25', '2025-08-24', 'Ecografo base per medicina generale'),
(7, 9, 'SN2024-LAB-001', '2025-10-30', '2025-10-29', 'Centrifuga da laboratorio'),
(8, 10, 'SN2023-ANA-002', '2025-09-05', '2025-09-04', 'Analizzatore ematologico'),
(3, 11, 'SN2024-STE-001', '2025-10-12', '2025-10-11', 'Sterilizzatore automatico'),
(9, 12, 'SN2023-MAM-001', '2025-08-18', '2025-08-17', 'Mammografo digitale'),
(10, 13, 'SN2024-LAS-001', '2025-11-08', '2025-11-07', 'Laser per chirurgia oftalmica'),
(4, 14, 'SN2024-ECO-010', '2025-10-22', '2025-10-21', 'Ecografo cardiologico avanzato'),
(11, 15, 'SN2023-FET-001', '2025-09-28', '2025-09-27', 'Monitor per controllo fetale'),
(12, 16, 'SN2024-PUM-002', '2025-11-03', '2025-11-02', 'Pompa infusione automatica'),
(5, 17, 'SN2024-ASP-001', '2025-10-18', '2025-10-17', 'Aspiratore chirurgico'),
(7, 18, 'SN2024-THE-005', '2025-11-12', '2025-11-11', 'Termometro infrarossi');


-- 5. Activities (Attivita)
-- Linking to created equipment.
-- Note: schema.sql has id_apparecchiatura.
-- I'm mapping specific activity seeds to the above equipment list.
INSERT INTO attivita (
  id_cliente, id_apparecchiatura, codice_inventario_cliente,
  modalita_apertura_richiesta, data_apertura_richiesta,
  numero_preventivo, data_preventivo,
  numero_accettazione_preventivo, data_accettazione_preventivo,
  stato, data_chiusura, note_generali, id_tecnico
) VALUES
  -- 1: ECG-300 for Client 1. This model wasn't in original equipment list, adding new equipment implicitly?
  -- Wait, for seed sanity, I should link to EXISTING equipment from step 4 or create new ones if they differ.
  -- Looking at original seed, Attivita 1 had 'Elettrocardiografo ECG-300' 'SN2024-ECG-001'.
  -- This was NOT in the initial equipment list. I will assume we should create equipment for these too or just leave null?
  -- The prompted goal is "data ragionevoli". I will link to existing equipment where it matches, otherwise I'll add equipment first.
  
  -- Let's simplify and link to some of the 18 equipment items we inserted.
  
  -- Activity on Equipment 1 (Client 1, ECO-PRO)
  (1, 1, 'INV-ECO-001', 'Portale', '2025-09-15', 'PREV-2025-006', '2025-09-16', 'ACC-2025-006', '2025-09-17', 'CHIUSO', '2025-09-22', 'Sostituzione cavo alimentazione', 1),
  
  -- Activity on Equipment 2 (Client 2, TAC)
  (2, 2, 'INV-TAC-002', 'Email', '2025-09-10', 'PREV-2025-009', '2025-09-11', 'ACC-2025-009', '2025-09-12', 'CHIUSO', '2025-09-18', 'Aggiornamento firmware', 2),
  
  -- Activity on Equipment 3 (Client 3, RX)
  (3, 3, 'INV-RX-001', 'Email', '2025-10-28', 'PREV-2025-003', '2025-10-29', 'ACC-2025-003', '2025-10-30', 'CHIUSO', '2025-11-05', 'Aggiornamento software', 1),
  
  -- Activity on Equipment 4 (Client 1, Monitor)
  (1, 4, 'INV-MON-001', 'Portale', '2025-11-18', NULL, NULL, NULL, NULL, 'APERTO', NULL, 'Verifica display necessaria', 1),
  
  -- Activity on Equipment 5 (Client 4, Defibrillator)
  (4, 5, 'INV-DEF-003', 'Telefono', '2025-11-10', 'PREV-2025-002', '2025-11-11', NULL, NULL, 'APERTO', NULL, 'Batterie esauste', 2);
