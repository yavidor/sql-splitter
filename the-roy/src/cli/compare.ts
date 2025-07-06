import { Command } from 'commander';
import { areFilesEqual } from '../lib/file-utils.js';
import { setupLogging, withTiming } from '../lib/cli-utils.js';

const program = new Command();
program
  .name('compare')
  .description('Compare files byte-for-byte using SHA256 hashes. Returns true/false. Simple.')
  .argument('<file1>', 'First file to compare')
  .argument('<file2>', 'Second file to compare')
  .option('--logs', 'Enable internal logging', false)
  .option('--level <level>', 'Log level: ERROR, WARN, INFO, LOG', 'INFO')
  .option('--time', 'Show timing for operation', false)
  .action(async (file1, file2, options) => {
    setupLogging({ logs: options.logs, level: options.level });
    try {
      const areEqual = await withTiming(
        () => areFilesEqual(file1, file2),
        options.time,
        'CompareTime'
      );
      console.log(areEqual); // Just true or false. Simple.
    } catch (err) {
      console.error("Couldn't compare files. Maybe one doesn't exist?", err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv); 