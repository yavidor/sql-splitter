import sqlite3 from 'sqlite3';
import fs from 'fs';
import { promisify } from 'util';
import { getRandomText } from './text-utils.js';
import * as logger from './logger-utils.js';

/**
 * Creates a gigantic SQLite database file for testing purposes.
 * It's slow, it's huge, it's exactly what you asked for.
 * @param dbPath - Where to save the DB.
 * @param targetBytes - How many bytes it should be.
 */
export async function createLargeDb(dbPath: string, targetBytes: number): Promise<void> {
    logger.log(`Creating SQLite database at ${dbPath}...`);
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = new sqlite3.Database(dbPath);
    const run = promisify(db.run.bind(db));

    await run(`CREATE TABLE data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )`);

    const stmt = db.prepare('INSERT INTO data (name, description) VALUES (?, ?)');
    const stmtRun = promisify(stmt.run.bind(stmt));

    let inserted = 0;
    const BATCH_SIZE = 1000;

    logger.log(`Target size: ${(targetBytes / 1024 / 1024 / 1024).toFixed(2)} GB. This will take a while.`);

    while (true) {
        await run('BEGIN TRANSACTION');
        for (let i = 0; i < BATCH_SIZE; i++) {
            // @ts-ignore
            await stmtRun(`Name_${inserted}`, getRandomText());
            inserted++;
        }
        await run('COMMIT');

        // Don't check the file size every single time, that's just stupid.
        if (inserted % 5000 === 0) {
            const { size } = fs.statSync(dbPath);
            logger.log(`Inserted ${inserted} rows... current size: ${(size / 1024 / 1024).toFixed(2)} MB`);
            if (size >= targetBytes) {
                logger.log('🎉 Done! Reached target size. Your disk hates you now.');
                break;
            }
        }
    }

    stmt.finalize();
    db.close();
} 