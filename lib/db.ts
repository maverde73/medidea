/**
 * Database utilities and helpers for Cloudflare D1
 */

import { Env } from "./env";

/**
 * Database client wrapper for D1
 */
export class DatabaseClient {
  constructor(private db: D1Database) {}

  /**
   * Execute a query and return all results
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.db.prepare(sql).bind(...params).all();
    return result.results as T[];
  }

  /**
   * Execute a query and return the first result
   */
  async queryFirst<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await this.db.prepare(sql).bind(...params).first();
    return result as T | null;
  }

  /**
   * Execute a mutation (INSERT, UPDATE, DELETE)
   */
  async execute(sql: string, params: any[] = []): Promise<D1Result> {
    return await this.db.prepare(sql).bind(...params).run();
  }

  /**
   * Execute multiple statements in a batch
   */
  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    return await this.db.batch(statements);
  }

  /**
   * Get the underlying D1Database instance
   */
  getRaw(): D1Database {
    return this.db;
  }
}

/**
 * Create a database client from environment
 */
export function createDatabaseClient(env: Env): DatabaseClient {
  return new DatabaseClient(env.DB);
}

/**
 * Sample queries for common operations
 */
export const queries = {
  // Clienti
  getClients: "SELECT * FROM clienti ORDER BY nome",
  getClientById: "SELECT * FROM clienti WHERE id = ?",
  createClient: "INSERT INTO clienti (nome, indirizzo, contatti) VALUES (?, ?, ?)",

  // Attività
  getActivities: "SELECT a.*, c.nome as cliente_nome FROM attivita a JOIN clienti c ON a.id_cliente = c.id ORDER BY a.data_apertura_richiesta DESC",
  getActivityById: "SELECT a.*, c.nome as cliente_nome FROM attivita a JOIN clienti c ON a.id_cliente = c.id WHERE a.id = ?",
  createActivity: `INSERT INTO attivita (
    id_cliente, modello, seriale, codice_inventario_cliente,
    modalita_apertura_richiesta, data_apertura_richiesta, stato
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`,

  // Interventi
  getInterventions: "SELECT * FROM interventi_attivita WHERE id_attivita = ? ORDER BY data_intervento DESC",
  createIntervention: "INSERT INTO interventi_attivita (id_attivita, data_intervento, descrizione_intervento, operatore) VALUES (?, ?, ?, ?)",

  // Apparecchiature
  getEquipment: "SELECT e.*, c.nome as cliente_nome FROM apparecchiature e JOIN clienti c ON e.id_cliente = c.id ORDER BY e.modello",
  getEquipmentById: "SELECT e.*, c.nome as cliente_nome FROM apparecchiature e JOIN clienti c ON e.id_cliente = c.id WHERE e.id = ?",
  createEquipment: "INSERT INTO apparecchiature (id_cliente, modello, seriale, data_test_funzionali, data_test_elettrici, note) VALUES (?, ?, ?, ?, ?, ?)",

  // Allegati
  getAttachments: "SELECT * FROM allegati WHERE tipo_riferimento = ? AND id_riferimento = ?",
  createAttachment: "INSERT INTO allegati (tipo_riferimento, id_riferimento, nome_file_originale, chiave_r2, mime_type, dimensione_bytes, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
};
