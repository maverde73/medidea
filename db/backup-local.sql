PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE clienti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  indirizzo TEXT,
  contatti TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO clienti VALUES(1,'Ospedale San Raffaele','Via Olgettina 60, Milano','info@sanraffaele.it, Tel: 02-26431','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(2,'Clinica Villa Maria','Corso Italia 23, Roma','info@villamaria.it, Tel: 06-12345678','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(3,'Poliambulatorio Central Medical','Via Garibaldi 15, Torino','info@centralmed.it, Tel: 011-987654','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(4,'Ospedale Maggiore','Piazza Ospedale 1, Bologna','contatti@maggiore.bo.it, Tel: 051-223344','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(5,'Casa di Cura Villa Aurora','Via Aurora 12, Firenze','info@villaaurora.it, Tel: 055-556677','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(6,'Clinica San Carlo','Viale San Carlo 45, Padova','info@sancarlo.pd.it, Tel: 049-778899','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(7,'Centro Diagnostico Gamma','Via Dante 78, Genova','gamma@diagnostici.ge.it, Tel: 010-334455','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(8,'Poliambulatorio Salus','Corso Venezia 34, Verona','info@salus.vr.it, Tel: 045-667788','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(9,'Clinica Santa Rita','Via Roma 89, Napoli','santarita@napoli.it, Tel: 081-445566','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(10,'Ospedale Civile','Piazza Civica 5, Brescia','info@civile.bs.it, Tel: 030-112233','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(11,'Centro Medico Leonardo','Via Leonardo 56, Pisa','leonardo@medico.pi.it, Tel: 050-998877','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO clienti VALUES(12,'Clinica Montefiore','Viale Montefiore 23, Trieste','info@montefiore.ts.it, Tel: 040-556644','2025-12-16 12:52:38','2025-12-16 12:52:38');
CREATE TABLE modelli_apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  descrizione TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO modelli_apparecchiature VALUES(1,'Ecografo ECO-PRO','Ecografo professionale per cardiologia','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(2,'TAC Scanner TAC-3000','Scanner TAC multi-slice','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(3,'Radiografo RX-Digital','Radiografo digitale portatile','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(4,'Monitor Paziente MP-500','Monitor multiparametrico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(5,'Defibrillatore DEF-AED','Defibrillatore semiautomatico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(6,'Ventilatore VENT-2000','Ventilatore polmonare ICU','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(7,'Elettrocardiografo ECG-12','ECG a 12 derivazioni','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(8,'Ecografo ECO-BASIC','Ecografo base per medicina generale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(9,'Centrifuga LAB-C500','Centrifuga da laboratorio','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(10,'Analizzatore ANALY-3000','Analizzatore ematologico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(11,'Sterilizzatore STER-AUTO','Sterilizzatore automatico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(12,'Mammografo MAMMO-DIG','Mammografo digitale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(13,'Laser Chirurgico LASER-X','Laser per chirurgia oftalmica','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(14,'Ecografo ECO-CARD','Ecografo cardiologico avanzato','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(15,'Monitor Fetale FET-200','Monitor per controllo fetale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(16,'Pompa Infusione PUMP-AUTO','Pompa infusione automatica','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(17,'Aspiratore ASP-SURG','Aspiratore chirurgico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(18,'Termometro THERM-IR','Termometro infrarossi','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(19,'Elettrocardiografo ECG-300','Elettrocardiografo portatile','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(20,'Monitor Paziente MP-200','Monitor paziente base','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(21,'Defibrillatore DEF-500','Defibrillatore ospedaliero','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modelli_apparecchiature VALUES(22,'SPIROMETRO XN24',NULL,'2025-12-18 11:06:22','2025-12-18 11:06:22');
CREATE TABLE attivita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  id_apparecchiatura INTEGER,
  codice_inventario_cliente TEXT,
  modalita_apertura_richiesta TEXT,
  data_apertura_richiesta TEXT,
  numero_preventivo TEXT,
  data_preventivo TEXT,
  numero_accettazione_preventivo TEXT,
  data_accettazione_preventivo TEXT,
  stato TEXT NOT NULL DEFAULT 'APERTO',
  data_chiusura TEXT,
  note_generali TEXT,
  descrizione_richiesta TEXT,
  data_presa_in_carico TEXT,
  reparto TEXT,
  tecnico TEXT,
  id_tecnico INTEGER,
  urgenza TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')), numero_verbale TEXT, global_service INTEGER DEFAULT 0, id_cliente_finale INTEGER REFERENCES clienti(id), sorgente_ordine TEXT, data_ordine TEXT, numero_contratto TEXT, data_contratto TEXT, data_intervento TEXT, ore_lavoro REAL, ore_viaggio REAL, modalita_intervento TEXT, tipi_apparecchiatura_json TEXT, tipi_intervento_json TEXT,
  FOREIGN KEY(id_cliente) REFERENCES clienti(id) ON DELETE RESTRICT,
  FOREIGN KEY(id_tecnico) REFERENCES tecnici(id) ON DELETE SET NULL,
  FOREIGN KEY(id_apparecchiatura) REFERENCES apparecchiature(id) ON DELETE SET NULL
);
INSERT INTO attivita VALUES(1,1,1,'INV-ECO-001','Portale','2025-09-15','PREV-2025-006','2025-09-16','ACC-2025-006','2025-09-17','CHIUSO','2025-09-22','Sostituzione cavo alimentazione',NULL,NULL,NULL,NULL,1,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO attivita VALUES(2,2,2,'INV-TAC-002','Email','2025-09-10','PREV-2025-009','2025-09-11','ACC-2025-009','2025-09-12','CHIUSO','2025-09-18','Aggiornamento firmware',NULL,NULL,NULL,NULL,2,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO attivita VALUES(3,3,3,'INV-RX-001','Email','2025-10-28','PREV-2025-003','2025-10-29','ACC-2025-003','2025-10-30','CHIUSO','2025-11-05','Aggiornamento software',NULL,NULL,NULL,NULL,1,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO attivita VALUES(4,1,4,'INV-MON-001','Portale','2025-11-18',NULL,NULL,NULL,NULL,'APERTO',NULL,'Verifica display necessaria',NULL,NULL,NULL,NULL,1,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO attivita VALUES(5,4,5,'INV-DEF-003','Telefono','2025-11-10','PREV-2025-002','2025-11-11',NULL,NULL,'APERTO',NULL,'Batterie esauste',NULL,NULL,NULL,NULL,2,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO attivita VALUES(6,5,6,NULL,'Portale','2025-12-17',NULL,NULL,NULL,NULL,'APERTO',NULL,NULL,'Test guasto completo sistema',NULL,'Radiologia',NULL,NULL,'BASSA','2025-12-17 11:26:46','2025-12-17 11:26:46',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO attivita VALUES(7,5,19,'00001223','Email','2025-12-11','00012','2025-12-28','345566','2025-12-29','APERTO',NULL,NULL,NULL,'2025-12-17','Pronto Soccorso',NULL,3,'ALTA','2025-12-18 11:07:56','2025-12-18 11:07:56',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
CREATE TABLE interventi_attivita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_attivita INTEGER NOT NULL,
  data_intervento TEXT NOT NULL,
  descrizione_intervento TEXT,
  operatore TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_attivita) REFERENCES attivita(id) ON DELETE CASCADE
);
CREATE TABLE apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  id_modello INTEGER NOT NULL,
  seriale TEXT,
  data_test_funzionali TEXT,
  data_test_elettrici TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_cliente) REFERENCES clienti(id) ON DELETE RESTRICT,
  FOREIGN KEY(id_modello) REFERENCES modelli_apparecchiature(id) ON DELETE RESTRICT
);
INSERT INTO apparecchiature VALUES(1,1,1,'SN2023-ECO-001','2025-10-15','2025-10-14','Ecografo professionale per cardiologia','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(2,2,2,'SN2023-TAC-002','2025-09-20','2025-09-19','Scanner TAC multi-slice','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(3,3,3,'SN2024-RX-001','2025-11-01','2025-10-31','Radiografo digitale portatile','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(4,1,4,'SN2024-MON-001','2025-11-05','2025-11-04','Monitor multiparametrico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(5,4,5,'SN2024-DEF-002','2025-10-20','2025-10-19','Defibrillatore semiautomatico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(6,5,6,'SN2023-VENT-001','2025-09-15','2025-09-14','Ventilatore polmonare ICU','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(7,6,7,'SN2024-ECG-003','2025-11-10','2025-11-09','ECG a 12 derivazioni','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(8,2,8,'SN2023-ECO-005','2025-08-25','2025-08-24','Ecografo base per medicina generale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(9,7,9,'SN2024-LAB-001','2025-10-30','2025-10-29','Centrifuga da laboratorio','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(10,8,10,'SN2023-ANA-002','2025-09-05','2025-09-04','Analizzatore ematologico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(11,3,11,'SN2024-STE-001','2025-10-12','2025-10-11','Sterilizzatore automatico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(12,9,12,'SN2023-MAM-001','2025-08-18','2025-08-17','Mammografo digitale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(13,10,13,'SN2024-LAS-001','2025-11-08','2025-11-07','Laser per chirurgia oftalmica','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(14,4,14,'SN2024-ECO-010','2025-10-22','2025-10-21','Ecografo cardiologico avanzato','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(15,11,15,'SN2023-FET-001','2025-09-28','2025-09-27','Monitor per controllo fetale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(16,12,16,'SN2024-PUM-002','2025-11-03','2025-11-02','Pompa infusione automatica','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(17,5,17,'SN2024-ASP-001','2025-10-18','2025-10-17','Aspiratore chirurgico','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(18,7,18,'SN2024-THE-005','2025-11-12','2025-11-11','Termometro infrarossi','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO apparecchiature VALUES(19,5,22,'SPX456',NULL,NULL,NULL,'2025-12-18 11:06:31','2025-12-18 11:06:31');
CREATE TABLE allegati (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_riferimento TEXT NOT NULL, 
  id_riferimento INTEGER NOT NULL,
  nome_file_originale TEXT NOT NULL,
  chiave_r2 TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  dimensione_bytes INTEGER,
  data_caricamento TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE utenti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', 
  active INTEGER NOT NULL DEFAULT 1, 
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO utenti VALUES(1,'admin@medidea.local','$2b$10$A4hMvRIfiFR2kL.q/q1sMef6r9jEINnlInXZ8UlaIO0U9Z6SWmBLi','Admin','User','admin',1,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO utenti VALUES(2,'tecnico1@medidea.local','$2b$10$A4hMvRIfiFR2kL.q/q1sMef6r9jEINnlInXZ8UlaIO0U9Z6SWmBLi','Mario','Rossi','tecnico',1,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO utenti VALUES(3,'tecnico2@medidea.local','$2b$10$A4hMvRIfiFR2kL.q/q1sMef6r9jEINnlInXZ8UlaIO0U9Z6SWmBLi','Giuseppe','Verdi','tecnico',1,NULL,'2025-12-16 12:52:38','2025-12-16 12:52:38');
CREATE TABLE tecnici (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  id_utente INTEGER UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_utente) REFERENCES utenti(id) ON DELETE SET NULL
);
INSERT INTO tecnici VALUES(1,'Mario','Rossi',2,'2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO tecnici VALUES(2,'Giuseppe','Verdi',3,'2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO tecnici VALUES(3,'PIinco','Pallino',NULL,'2025-12-18 11:07:24','2025-12-18 11:07:24');
CREATE TABLE reparti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  descrizione TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO reparti VALUES(1,'Cardiologia','Reparto di Cardiologia e Unità Coronarica','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(2,'Radiologia','Diagnostica per immagini','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(3,'Terapia Intensiva','Rianimazione e Terapia Intensiva','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(4,'Chirurgia Generale','Sale operatorie chirurgia generale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(5,'Laboratorio Analisi','Laboratorio analisi chimico-cliniche','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(6,'Ostetricia e Ginecologia','Reparto materno-infantile','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(7,'Pronto Soccorso','Emergenza e urgenza','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(8,'Ortopedia','Reparto di Ortopedia e Traumatologia','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(9,'Neurologia','Reparto di Neurologia','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO reparti VALUES(10,'Oculistica','Reparto di Oftalmologia','2025-12-16 12:52:38','2025-12-16 12:52:38');
CREATE TABLE modalita_apertura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descrizione TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO modalita_apertura VALUES(1,'Telefono','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modalita_apertura VALUES(2,'Email','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modalita_apertura VALUES(3,'Portale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modalita_apertura VALUES(4,'Verbale','2025-12-16 12:52:38','2025-12-16 12:52:38');
INSERT INTO modalita_apertura VALUES(5,'WhatsApp','2025-12-16 12:52:38','2025-12-16 12:52:38');
CREATE TABLE _cf_METADATA (
        key INTEGER PRIMARY KEY,
        value BLOB
      );
INSERT INTO _cf_METADATA VALUES(2,505);
CREATE TABLE attivita_apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_attivita INTEGER NOT NULL,
  id_apparecchiatura INTEGER NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(id_attivita) REFERENCES attivita(id) ON DELETE CASCADE,
  FOREIGN KEY(id_apparecchiatura) REFERENCES apparecchiature(id) ON DELETE RESTRICT,
  UNIQUE(id_attivita, id_apparecchiatura)
);
CREATE TABLE ricambi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT NOT NULL,
  prezzo_unitario REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO ricambi VALUES(1,'BT-6CK','Batteria Ricaricabile Plum 360',150.0,'2025-12-17 10:16:35','2025-12-17 10:16:35');
INSERT INTO ricambi VALUES(2,'FLT-001','Filtro Aria Standard',25.0,'2025-12-17 10:16:35','2025-12-17 10:16:35');
INSERT INTO ricambi VALUES(3,'CBL-PWR','Cavo Alimentazione',35.0,'2025-12-17 10:16:35','2025-12-17 10:16:35');
CREATE TABLE attivita_ricambi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_attivita INTEGER NOT NULL,
  id_ricambio INTEGER NOT NULL,
  quantita INTEGER DEFAULT 1,
  seriale TEXT, 
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(id_attivita) REFERENCES attivita(id) ON DELETE CASCADE,
  FOREIGN KEY(id_ricambio) REFERENCES ricambi(id) ON DELETE RESTRICT
);
CREATE TABLE modalita_intervento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT NOT NULL,
  ordine INTEGER DEFAULT 0
);
INSERT INTO modalita_intervento VALUES(1,'garanzia','Intervento in garanzia',1);
INSERT INTO modalita_intervento VALUES(2,'contratto','Intervento in contratto',2);
INSERT INTO modalita_intervento VALUES(3,'fuori_contratto','Intervento fuori contratto',3);
INSERT INTO modalita_intervento VALUES(4,'supporto_casa_madre','Supporto casa madre',4);
INSERT INTO modalita_intervento VALUES(5,'supporto_vendite','Supporto vendite',5);
CREATE TABLE tipi_apparecchiatura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT NOT NULL,
  ordine INTEGER DEFAULT 0
);
INSERT INTO tipi_apparecchiatura VALUES(1,'tavolo_operatorio','Tavolo Operatorio',1);
INSERT INTO tipi_apparecchiatura VALUES(2,'stativo_pensile','Stativo Pensile',2);
INSERT INTO tipi_apparecchiatura VALUES(3,'lampada_scialitica','Lampada Scialitica',3);
INSERT INTO tipi_apparecchiatura VALUES(4,'letto_degenza','Letto Degenza',4);
INSERT INTO tipi_apparecchiatura VALUES(5,'defibrillatore','Defibrillatore',5);
INSERT INTO tipi_apparecchiatura VALUES(6,'arredi','Arredi',6);
INSERT INTO tipi_apparecchiatura VALUES(7,'monitor','Monitor',7);
INSERT INTO tipi_apparecchiatura VALUES(8,'em_generico','EM Generico',8);
INSERT INTO tipi_apparecchiatura VALUES(9,'elettrocardiografo','Elettrocardiografo',9);
INSERT INTO tipi_apparecchiatura VALUES(10,'ventilatore','Ventilatore',10);
CREATE TABLE tipi_intervento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT NOT NULL,
  ordine INTEGER DEFAULT 0
);
INSERT INTO tipi_intervento VALUES(1,'meccanico','Meccanico',1);
INSERT INTO tipi_intervento VALUES(2,'elettronico','Elettronico',2);
INSERT INTO tipi_intervento VALUES(3,'componenti','Componenti',3);
INSERT INTO tipi_intervento VALUES(4,'software','Software',4);
INSERT INTO tipi_intervento VALUES(5,'aggiornamento','Aggiornamento',5);
INSERT INTO tipi_intervento VALUES(6,'altro','Altro',6);
INSERT INTO tipi_intervento VALUES(7,'formazione','Formazione',7);
INSERT INTO tipi_intervento VALUES(8,'verifiche_elettriche','Verifiche Elettriche',8);
INSERT INTO tipi_intervento VALUES(9,'funzionali','Funzionali',9);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('utenti',3);
INSERT INTO sqlite_sequence VALUES('tecnici',3);
INSERT INTO sqlite_sequence VALUES('clienti',12);
INSERT INTO sqlite_sequence VALUES('modelli_apparecchiature',22);
INSERT INTO sqlite_sequence VALUES('apparecchiature',19);
INSERT INTO sqlite_sequence VALUES('attivita',7);
INSERT INTO sqlite_sequence VALUES('reparti',10);
INSERT INTO sqlite_sequence VALUES('modalita_apertura',5);
INSERT INTO sqlite_sequence VALUES('modalita_intervento',5);
INSERT INTO sqlite_sequence VALUES('tipi_apparecchiatura',10);
INSERT INTO sqlite_sequence VALUES('tipi_intervento',9);
INSERT INTO sqlite_sequence VALUES('ricambi',3);
CREATE INDEX idx_attivita_cliente ON attivita(id_cliente);
CREATE INDEX idx_attivita_stato ON attivita(stato);
CREATE INDEX idx_attivita_data_apertura ON attivita(data_apertura_richiesta);
CREATE INDEX idx_attivita_apparecchiatura ON attivita(id_apparecchiatura);
CREATE INDEX idx_interventi_attivita ON interventi_attivita(id_attivita);
CREATE INDEX idx_interventi_data ON interventi_attivita(data_intervento);
CREATE INDEX idx_apparecchiature_cliente ON apparecchiature(id_cliente);
CREATE INDEX idx_apparecchiature_modello ON apparecchiature(id_modello);
CREATE INDEX idx_allegati_riferimento ON allegati(tipo_riferimento, id_riferimento);
CREATE INDEX idx_allegati_chiave_r2 ON allegati(chiave_r2);
CREATE INDEX idx_utenti_email ON utenti(email);
CREATE INDEX idx_utenti_role ON utenti(role);
CREATE INDEX idx_utenti_active ON utenti(active);
CREATE INDEX idx_attivita_app ON attivita_apparecchiature(id_attivita);
CREATE INDEX idx_attivita_ricambi ON attivita_ricambi(id_attivita);
COMMIT;
