import { Command } from 'commander';
import { reconstructFromChunks } from '../lib/file-utils.js';
import { setupLogging, withTiming } from '../lib/cli-utils.js';

const program = new Command();
program
  .name('reconstruct')
  .description('Reconstruct a file from chunk directory. Actually works, surprisingly.')
  .argument('<chunks-dir>', 'Directory containing chunk files')
  .argument('<output-file>', 'Output file path')
  .option('--logs', 'Enable internal logging', false)
  .option('--level <level>', 'Log level: ERROR, WARN, INFO, LOG', 'INFO')
  .option('--time', 'Show timing for operation', false)
  .action(async (chunksDir, outputFile, options) => {
    setupLogging({ logs: options.logs, level: options.level });
    console.log(`Reconstructing from '${chunksDir}' into '${outputFile}'...`);
    try {
      await withTiming(
        () => reconstructFromChunks(chunksDir, outputFile),
        options.time,
        'ReconstructTime'
      );
      console.log('✅ Reconstruction complete. It actually worked.');
    } catch (err) {
      console.error('Error reconstructing file. Knew it was too good to be true.', err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv); 