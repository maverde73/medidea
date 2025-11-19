-- Seed data for development and testing

-- Insert sample clients
INSERT INTO clienti (nome, indirizzo, contatti) VALUES
  ('Ospedale San Raffaele', 'Via Olgettina 60, Milano', 'info@sanraffaele.it'),
  ('Clinica Villa Maria', 'Corso Italia 23, Roma', '06-12345678'),
  ('Poliambulatorio Central Medical', 'Via Garibaldi 15, Torino', 'info@centralmed.it');

-- Insert sample attivita
INSERT INTO attivita (
  id_cliente,
  modello,
  seriale,
  codice_inventario_cliente,
  modalita_apertura_richiesta,
  data_apertura_richiesta,
  stato
) VALUES
  (1, 'Elettrocardiografo ECG-300', 'SN2024001', 'INV-ECG-001', 'Email', '2025-11-15', 'APERTO'),
  (2, 'Defibrillatore DEF-500', 'SN2024002', 'INV-DEF-002', 'Telefono', '2025-11-10', 'CHIUSO'),
  (1, 'Monitor Paziente MP-200', 'SN2024003', 'INV-MON-003', 'Portale', '2025-11-18', 'APERTO');

-- Insert sample interventi
INSERT INTO interventi_attivita (
  id_attivita,
  data_intervento,
  descrizione_intervento,
  operatore
) VALUES
  (1, '2025-11-16', 'Verifica funzionamento e calibrazione elettrodi', 'Mario Rossi'),
  (2, '2025-11-12', 'Sostituzione batterie e test funzionale', 'Giuseppe Verdi'),
  (2, '2025-11-13', 'Collaudo finale e certificazione', 'Giuseppe Verdi');

-- Insert sample apparecchiature
INSERT INTO apparecchiature (
  id_cliente,
  modello,
  seriale,
  data_test_funzionali,
  data_test_elettrici
) VALUES
  (1, 'Ecografo ECO-PRO', 'SN2023-ECO-001', '2025-10-15', '2025-10-14'),
  (2, 'TAC Scanner TAC-3000', 'SN2023-TAC-002', '2025-09-20', '2025-09-19'),
  (3, 'Radiografo RX-Digital', 'SN2024-RX-001', '2025-11-01', '2025-10-31');
