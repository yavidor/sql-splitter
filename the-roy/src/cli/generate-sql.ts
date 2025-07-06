import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { createLargeDb } from '../lib/sql-utils.js';
import { setupLogging, withTiming } from '../lib/cli-utils.js';

// Again, this bullshit for __dirname.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();
program
  .name('generate-sql')
  .description('Create a gigantic SQLite database. Your disk will hate you.')
  .argument('<size-gb>', 'Target DB size in GB')
  .argument('[output-filename]', 'Output file name', 'very-large-database.sqlite')
  .option('--logs', 'Enable internal logging', false)
  .option('--level <level>', 'Log level: ERROR, WARN, INFO, LOG', 'INFO')
  .option('--time', 'Show timing for operation', false)
  .action(async (sizeGb: string, outputFilename: string, options: { logs: any; level: any; time: boolean; }) => {
    setupLogging({ logs: options.logs, level: options.level });
    const targetSizeGB = parseFloat(sizeGb);
    if (!targetSizeGB || targetSizeGB <= 0) {
      program.error('Target size must be a positive number.');
    }
    const dbPath = path.resolve(__dirname, '../../', outputFilename);
    const targetBytes = targetSizeGB * 1024 * 1024 * 1024;
    try {
      await withTiming(
        () => createLargeDb(dbPath, targetBytes),
        options.time,
        'GenerateSqlTime'
      );
    } catch (err) {
      console.error("Well, that didn't work. Error:", err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv); 