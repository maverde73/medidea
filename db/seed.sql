-- Seed data for development and testing

-- Insert sample clients (12 total)
INSERT INTO clienti (nome, indirizzo, contatti, created_at, updated_at) VALUES
  ('Ospedale San Raffaele', 'Via Olgettina 60, Milano', 'info@sanraffaele.it, Tel: 02-26431', datetime('now'), datetime('now')),
  ('Clinica Villa Maria', 'Corso Italia 23, Roma', 'info@villamaria.it, Tel: 06-12345678', datetime('now'), datetime('now')),
  ('Poliambulatorio Central Medical', 'Via Garibaldi 15, Torino', 'info@centralmed.it, Tel: 011-987654', datetime('now'), datetime('now')),
  ('Ospedale Maggiore', 'Piazza Ospedale 1, Bologna', 'contatti@maggiore.bo.it, Tel: 051-223344', datetime('now'), datetime('now')),
  ('Casa di Cura Villa Aurora', 'Via Aurora 12, Firenze', 'info@villaaurora.it, Tel: 055-556677', datetime('now'), datetime('now')),
  ('Clinica San Carlo', 'Viale San Carlo 45, Padova', 'info@sancarlo.pd.it, Tel: 049-778899', datetime('now'), datetime('now')),
  ('Centro Diagnostico Gamma', 'Via Dante 78, Genova', 'gamma@diagnostici.ge.it, Tel: 010-334455', datetime('now'), datetime('now')),
  ('Poliambulatorio Salus', 'Corso Venezia 34, Verona', 'info@salus.vr.it, Tel: 045-667788', datetime('now'), datetime('now')),
  ('Clinica Santa Rita', 'Via Roma 89, Napoli', 'santarita@napoli.it, Tel: 081-445566', datetime('now'), datetime('now')),
  ('Ospedale Civile', 'Piazza Civica 5, Brescia', 'info@civile.bs.it, Tel: 030-112233', datetime('now'), datetime('now')),
  ('Centro Medico Leonardo', 'Via Leonardo 56, Pisa', 'leonardo@medico.pi.it, Tel: 050-998877', datetime('now'), datetime('now')),
  ('Clinica Montefiore', 'Viale Montefiore 23, Trieste', 'info@montefiore.ts.it, Tel: 040-556644', datetime('now'), datetime('now'));

-- Insert sample apparecchiature (18 total)
INSERT INTO apparecchiature (id_cliente, modello, seriale, data_test_funzionali, data_test_elettrici, note, created_at, updated_at) VALUES
  (1, 'Ecografo ECO-PRO', 'SN2023-ECO-001', '2025-10-15', '2025-10-14', 'Ecografo professionale per cardiologia', datetime('now'), datetime('now')),
  (2, 'TAC Scanner TAC-3000', 'SN2023-TAC-002', '2025-09-20', '2025-09-19', 'Scanner TAC multi-slice', datetime('now'), datetime('now')),
  (3, 'Radiografo RX-Digital', 'SN2024-RX-001', '2025-11-01', '2025-10-31', 'Radiografo digitale portatile', datetime('now'), datetime('now')),
  (1, 'Monitor Paziente MP-500', 'SN2024-MON-001', '2025-11-05', '2025-11-04', 'Monitor multiparametrico', datetime('now'), datetime('now')),
  (4, 'Defibrillatore DEF-AED', 'SN2024-DEF-002', '2025-10-20', '2025-10-19', 'Defibrillatore semiautomatico', datetime('now'), datetime('now')),
  (5, 'Ventilatore VENT-2000', 'SN2023-VENT-001', '2025-09-15', '2025-09-14', 'Ventilatore polmonare ICU', datetime('now'), datetime('now')),
  (6, 'Elettrocardiografo ECG-12', 'SN2024-ECG-003', '2025-11-10', '2025-11-09', 'ECG a 12 derivazioni', datetime('now'), datetime('now')),
  (2, 'Ecografo ECO-BASIC', 'SN2023-ECO-005', '2025-08-25', '2025-08-24', 'Ecografo base per medicina generale', datetime('now'), datetime('now')),
  (7, 'Centrifuga LAB-C500', 'SN2024-LAB-001', '2025-10-30', '2025-10-29', 'Centrifuga da laboratorio', datetime('now'), datetime('now')),
  (8, 'Analizzatore ANALY-3000', 'SN2023-ANA-002', '2025-09-05', '2025-09-04', 'Analizzatore ematologico', datetime('now'), datetime('now')),
  (3, 'Sterilizzatore STER-AUTO', 'SN2024-STE-001', '2025-10-12', '2025-10-11', 'Sterilizzatore automatico', datetime('now'), datetime('now')),
  (9, 'Mammografo MAMMO-DIG', 'SN2023-MAM-001', '2025-08-18', '2025-08-17', 'Mammografo digitale', datetime('now'), datetime('now')),
  (10, 'Laser Chirurgico LASER-X', 'SN2024-LAS-001', '2025-11-08', '2025-11-07', 'Laser per chirurgia oftalmica', datetime('now'), datetime('now')),
  (4, 'Ecografo ECO-CARD', 'SN2024-ECO-010', '2025-10-22', '2025-10-21', 'Ecografo cardiologico avanzato', datetime('now'), datetime('now')),
  (11, 'Monitor Fetale FET-200', 'SN2023-FET-001', '2025-09-28', '2025-09-27', 'Monitor per controllo fetale', datetime('now'), datetime('now')),
  (12, 'Pompa Infusione PUMP-AUTO', 'SN2024-PUM-002', '2025-11-03', '2025-11-02', 'Pompa infusione automatica', datetime('now'), datetime('now')),
  (5, 'Aspiratore ASP-SURG', 'SN2024-ASP-001', '2025-10-18', '2025-10-17', 'Aspiratore chirurgico', datetime('now'), datetime('now')),
  (7, 'Termometro THERM-IR', 'SN2024-THE-005', '2025-11-12', '2025-11-11', 'Termometro infrarossi', datetime('now'), datetime('now'));

-- Insert sample attivita (25 total)
INSERT INTO attivita (
  id_cliente, modello, seriale, codice_inventario_cliente,
  modalita_apertura_richiesta, data_apertura_richiesta,
  numero_preventivo, data_preventivo,
  numero_accettazione_preventivo, data_accettazione_preventivo,
  stato, data_chiusura, note_generali, created_at, updated_at
) VALUES
  (1, 'Elettrocardiografo ECG-300', 'SN2024-ECG-001', 'INV-ECG-001', 'Email', '2025-11-15', 'PREV-2025-001', '2025-11-16', 'ACC-2025-001', '2025-11-17', 'APERTO', NULL, 'Calibrazione elettrodi richiesta', datetime('now'), datetime('now')),
  (2, 'Defibrillatore DEF-500', 'SN2024-DEF-002', 'INV-DEF-002', 'Telefono', '2025-11-10', 'PREV-2025-002', '2025-11-11', 'ACC-2025-002', '2025-11-11', 'CHIUSO', '2025-11-14', 'Sostituzione batterie completata', datetime('now'), datetime('now')),
  (1, 'Monitor Paziente MP-200', 'SN2024-MON-003', 'INV-MON-003', 'Portale', '2025-11-18', NULL, NULL, NULL, NULL, 'APERTO', NULL, 'Verifica display necessaria', datetime('now'), datetime('now')),
  (3, 'Radiografo RX-Digital', 'SN2024-RX-001', 'INV-RX-001', 'Email', '2025-10-28', 'PREV-2025-003', '2025-10-29', 'ACC-2025-003', '2025-10-30', 'CHIUSO', '2025-11-05', 'Aggiornamento software', datetime('now'), datetime('now')),
  (4, 'Ecografo ECO-CARD', 'SN2024-ECO-010', 'INV-ECO-010', 'Telefono', '2025-11-12', 'PREV-2025-004', '2025-11-13', NULL, NULL, 'APERTO', NULL, 'Sonda difettosa', datetime('now'), datetime('now')),
  (5, 'Ventilatore VENT-2000', 'SN2023-VENT-001', 'INV-VENT-001', 'Email', '2025-10-20', 'PREV-2025-005', '2025-10-21', 'ACC-2025-005', '2025-10-22', 'CHIUSO', '2025-10-27', 'Manutenzione ordinaria completata', datetime('now'), datetime('now')),
  (1, 'Ecografo ECO-PRO', 'SN2023-ECO-001', 'INV-ECO-001', 'Portale', '2025-09-15', 'PREV-2025-006', '2025-09-16', 'ACC-2025-006', '2025-09-17', 'CHIUSO', '2025-09-22', 'Sostituzione cavo alimentazione', datetime('now'), datetime('now')),
  (6, 'Elettrocardiografo ECG-12', 'SN2024-ECG-003', 'INV-ECG-003', 'Email', '2025-11-08', 'PREV-2025-007', '2025-11-09', 'ACC-2025-007', '2025-11-10', 'APERTO', NULL, 'Calibrazione richiesta', datetime('now'), datetime('now')),
  (7, 'Centrifuga LAB-C500', 'SN2024-LAB-001', 'INV-LAB-001', 'Telefono', '2025-10-25', 'PREV-2025-008', '2025-10-26', 'ACC-2025-008', '2025-10-27', 'RIAPERTO', NULL, 'Problema non risolto', datetime('now'), datetime('now')),
  (2, 'TAC Scanner TAC-3000', 'SN2023-TAC-002', 'INV-TAC-002', 'Email', '2025-09-10', 'PREV-2025-009', '2025-09-11', 'ACC-2025-009', '2025-09-12', 'CHIUSO', '2025-09-18', 'Aggiornamento firmware', datetime('now'), datetime('now')),
  (8, 'Analizzatore ANALY-3000', 'SN2023-ANA-002', 'INV-ANA-002', 'Portale', '2025-11-05', NULL, NULL, NULL, NULL, 'APERTO', NULL, 'In attesa di preventivo', datetime('now'), datetime('now')),
  (9, 'Mammografo MAMMO-DIG', 'SN2023-MAM-001', 'INV-MAM-001', 'Email', '2025-10-15', 'PREV-2025-010', '2025-10-16', 'ACC-2025-010', '2025-10-17', 'CHIUSO', '2025-10-23', 'Taratura completata', datetime('now'), datetime('now')),
  (3, 'Sterilizzatore STER-AUTO', 'SN2024-STE-001', 'INV-STE-001', 'Telefono', '2025-11-01', 'PREV-2025-011', '2025-11-02', NULL, NULL, 'APERTO', NULL, 'Valvola sicurezza da sostituire', datetime('now'), datetime('now')),
  (10, 'Laser Chirurgico LASER-X', 'SN2024-LAS-001', 'INV-LAS-001', 'Email', '2025-10-08', 'PREV-2025-012', '2025-10-09', 'ACC-2025-012', '2025-10-10', 'CHIUSO', '2025-10-15', 'Allineamento ottica', datetime('now'), datetime('now')),
  (11, 'Monitor Fetale FET-200', 'SN2023-FET-001', 'INV-FET-001', 'Portale', '2025-11-14', 'PREV-2025-013', '2025-11-15', 'ACC-2025-013', '2025-11-16', 'APERTO', NULL, 'Sensori da verificare', datetime('now'), datetime('now')),
  (4, 'Monitor Paziente MP-500', 'SN2024-MON-001', 'INV-MON-001', 'Email', '2025-09-25', 'PREV-2025-014', '2025-09-26', 'ACC-2025-014', '2025-09-27', 'CHIUSO', '2025-10-02', 'Sostituzione schermo', datetime('now'), datetime('now')),
  (12, 'Pompa Infusione PUMP-AUTO', 'SN2024-PUM-002', 'INV-PUM-002', 'Telefono', '2025-11-07', 'PREV-2025-015', '2025-11-08', NULL, NULL, 'APERTO', NULL, 'Meccanismo bloccato', datetime('now'), datetime('now')),
  (5, 'Aspiratore ASP-SURG', 'SN2024-ASP-001', 'INV-ASP-001', 'Email', '2025-10-18', 'PREV-2025-016', '2025-10-19', 'ACC-2025-016', '2025-10-20', 'CHIUSO', '2025-10-24', 'Filtro sostituito', datetime('now'), datetime('now')),
  (6, 'Defibrillatore DEF-AED', 'SN2024-DEF-002', 'INV-DEF-003', 'Portale', '2025-11-11', NULL, NULL, NULL, NULL, 'APERTO', NULL, 'Test batterie necessario', datetime('now'), datetime('now')),
  (7, 'Termometro THERM-IR', 'SN2024-THE-005', 'INV-THE-005', 'Email', '2025-10-30', 'PREV-2025-017', '2025-10-31', 'ACC-2025-017', '2025-11-01', 'RIAPERTO', NULL, 'Letture imprecise', datetime('now'), datetime('now')),
  (2, 'Ecografo ECO-BASIC', 'SN2023-ECO-005', 'INV-ECO-005', 'Telefono', '2025-09-05', 'PREV-2025-018', '2025-09-06', 'ACC-2025-018', '2025-09-07', 'CHIUSO', '2025-09-12', 'Aggiornamento database preset', datetime('now'), datetime('now')),
  (8, 'Monitor Paziente MP-200', 'SN2024-MON-008', 'INV-MON-008', 'Email', '2025-11-16', 'PREV-2025-019', '2025-11-17', 'ACC-2025-019', '2025-11-18', 'APERTO', NULL, 'Allarmi non funzionanti', datetime('now'), datetime('now')),
  (9, 'Elettrocardiografo ECG-300', 'SN2024-ECG-009', 'INV-ECG-009', 'Portale', '2025-10-12', 'PREV-2025-020', '2025-10-13', 'ACC-2025-020', '2025-10-14', 'CHIUSO', '2025-10-19', 'Stampa riparata', datetime('now'), datetime('now')),
  (1, 'Defibrillatore DEF-500', 'SN2024-DEF-010', 'INV-DEF-010', 'Email', '2025-11-19', NULL, NULL, NULL, NULL, 'APERTO', NULL, 'Appena aperto', datetime('now'), datetime('now')),
  (10, 'Radiografo RX-Digital', 'SN2024-RX-010', 'INV-RX-010', 'Telefono', '2025-10-22', 'PREV-2025-021', '2025-10-23', 'ACC-2025-021', '2025-10-24', 'CHIUSO', '2025-10-29', 'Calibrazione raggi X', datetime('now'), datetime('now'));

-- Insert sample interventi (10 total)
INSERT INTO interventi_attivita (
  id_attivita, data_intervento, descrizione_intervento, operatore, created_at, updated_at
) VALUES
  (1, '2025-11-16', 'Verifica funzionamento e calibrazione elettrodi. Test di precisione eseguito con successo.', 'Mario Rossi', datetime('now'), datetime('now')),
  (2, '2025-11-12', 'Sostituzione batterie principali e backup. Test di carica effettuato.', 'Giuseppe Verdi', datetime('now'), datetime('now')),
  (2, '2025-11-13', 'Collaudo finale con test di scarica. Certificazione rilasciata.', 'Giuseppe Verdi', datetime('now'), datetime('now')),
  (4, '2025-10-29', 'Installazione nuovo firmware versione 3.2.1. Backup configurazione precedente.', 'Luigi Bianchi', datetime('now'), datetime('now')),
  (4, '2025-11-02', 'Verifica post-aggiornamento. Tutti i parametri nei limiti di specifica.', 'Luigi Bianchi', datetime('now'), datetime('now')),
  (6, '2025-10-23', 'Pulizia filtri aria e controllo pressioni. Sostituzione guarnizioni usurate.', 'Anna Ferrari', datetime('now'), datetime('now')),
  (9, '2025-10-27', 'Prima diagnosi: motore centrifuga rumoroso. Necessaria sostituzione cuscinetti.', 'Marco Colombo', datetime('now'), datetime('now')),
  (14, '2025-10-11', 'Taratura sistema ottico laser. Allineamento beam completato con successo.', 'Francesca Russo', datetime('now'), datetime('now')),
  (16, '2025-09-28', 'Sostituzione display LCD danneggiato. Test funzionale completato.', 'Pietro Romano', datetime('now'), datetime('now')),
  (25, '2025-11-19', 'Apertura intervento: verifica iniziale dello stato dell''apparecchiatura.', 'Mario Rossi', datetime('now'), datetime('now'));
