# Analisi Documento Operativo vs Sistema Medidea

## 1. Analisi del Documento
**Nome File**: `1212DL POMPA PLUM 360 SN 20967911 - 20967578.pdf`
**Tipo Presunto**: Rapporto di Intervento Tecnico / Documento di Lavoro (DL)
**Oggetto**: Manutenzione/Riparazione Pompa Infusionale (Plum 360)

### Informazioni Identificabili dal File:
1.  **Identificativo Documento**: "1212DL" (Probabile ID univoco del rapporto cartaceo).
2.  **Apparecchiatura**: "POMPA PLUM 360" (Modello).
3.  **Serial Number (SN)**: "20967911 - 20967578" (Multipli seriali o range? Probabilmente due apparecchiature distinte trattate nello stesso documento o un errore di formattazione nel nome file, assumiamo gestione di un *asset* specifico).

### Contenuti Tipici di Tali Documenti (Inferiti):
Un verbale di intervento standard per elettromedicali contiene solitamente:
*   **Dati Cliente**: Ospedale/Clinica, Reparto (es. Terapia Intensiva).
*   **Dati Apparecchiatura**: Produttore (Hospira/ICU Medical), Modello, Seriale, Inventario Cliente.
*   **Tipo Intervento**: Manutenzione Preventiva, Correttiva, Verifica di Sicurezza Elettrica (VSE).
*   **Checklist Controlli**:
    *   Ispezione visiva (integrità chassis, cavi).
    *   Test accensione/autodiagnosi.
    *   **Test Funzionali**: Verifica portata flusso, verifica sensori occlusione, verifica allarmi.
    *   **Verifiche Sicurezza Elettrica**: Resistenza terra, correnti di dispersione (secondo norma CEI 62-5 / IEC 60601).
*   **Strumentazione Usata**: Analizzatore di sicurezza, analizzatore pompe infusione (con scadenze taratura).
*   **Esito**: Superato / Non Superato / In Osservazione.
*   **Parti di Ricambio**: Codici e quantità delle parti sostituite.
*   **Note/Osservazioni**: Commenti del tecnico.
*   **Firme**: Tecnico e Responsabile Reparto.

## 2. Confronto con lo Schema Attuale (Medidea)

| Informazione | Gestione Attuale Medidea (`attivita` / `apparecchiature` DB) | Gap / Differenze |
| :--- | :--- | :--- |
| **ID Verbale** | `id` (autoincrement), `codice_inventario_cliente` | Manca un campo specifico per "ID Verbale Cartaceo" o "Riferimento Esterno" se diverso dal numero preventivo. |
| **Cliente/Reparto** | `id_cliente` (relazione), `reparto` (stringa/lookup) | Copertura adeguata. La tabella `reparti` ora standardizza questo dato. |
| **Apparecchiatura** | `id_apparecchiatura` (relazione), `modelli_apparecchiature` | Copertura adeguata. Il seriale è gestito. |
| **Tecnico** | `id_tecnico` (relazione) | Copertura adeguata. |
| **Checklist VSE** | Singolo campo data `data_test_elettrici` | **CRITICO**: Manca il dettaglio dei valori misurati (µA, mΩ). Abbiamo solo una data. |
| **Test Funzionali** | Singolo campo data `data_test_funzionali` | **CRITICO**: Manca la checklist delle prove effettuate (es. "Allarme aria: OK", "Flusso 100ml/h: Rilevato 99ml/h"). |
| **Strumentazione** | Non gestito | Manca tracciabilità degli strumenti campione usati per la certificazione. |
| **Ricambi** | Non gestito (solo `note_generali` o `descrizione_intervento`) | Manca una tabella `ricambi_attivita` per scarico magazzino o tracciabilità costi. |
| **Firme** | Non gestito | Il workflow è digitale ma senza firma biometrica o approvazione formale. |

## 3. Proposte di Miglioramento

Per evolvere il sistema da "Registro Attività" a "Gestionale Verifiche Elettromedicali", proponiamo:

### A. Digitalizzazione Checklist (Task Futuro: "Schede Tecniche")
Creare una struttura JSON o tabelle dedicate per definire "Protocolli di Verifica" associati al Modello o alla Categoria di apparecchio.
*   *Esempio*: La Pompa Infusionale avrà il protocollo "VSE + Verifica Flusso".
*   L'attività permetterà di compilare questi campi direttamente su tablet/PC.

### B. Gestione Strumentazione
Aggiungere una tabella `strumentazione` (es. Analizzatore sicurezza) e permettere di selezionare "Strumento usato" nell'attività, riportando automaticamente le date di scadenza taratura nel report PDF generato.

### C. Generazione PDF Verbale
Implementare la generazione automatica del PDF (simile a quello analizzato) a partire dai dati inseriti, con layout professionale ("1212DL..."), da inviare automaticamente al cliente.

### D. Gestione Multi-Asset
Il nome file suggerisce due seriali ("...7911 - ...7578"). Attualmente un'attività lega 1 apparecchiatura.
*   *Miglioramento*: "Attività Cumulativa" o "Lista Apparecchiature" per singola attività di manutenzione programmata (es. "Manutenzione annuale Parco Pompe").

## 4. Azioni Immediate Implementabili
1.  **Arricchimento Note**: Usare il campo `descrizione_intervento` per strutturare (anche solo come testo preformattato) i valori chiave rilevati.
2.  **Allegati**: Continuare a caricare il PDF originale (come quello in Scaricati) nella sezione "Allegati" dell'attività, come previsto dal Task 34.
