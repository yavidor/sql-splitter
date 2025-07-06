import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { getRandomInt } from '../lib/text-utils.js';
import { CHARS } from '../lib/constants.js';
import * as logger from '../lib/logger-utils.js';
import { setupLogging, withTiming } from '../lib/cli-utils.js';

// ES modules don't have __dirname. This is the new, "better" way.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getRandomChunk(length: number): string {
    return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

async function generateFile(outputFile: string, targetSizeGB: number): Promise<void> {
    const targetSizeBytes = targetSizeGB * 1024 * 1024 * 1024;
    const minChunk = 399;
    const maxChunk = 15000;

    console.log(`Creating file: ${outputFile}`);
    
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(outputFile, { flags: 'w' });
        
        let written = 0;
        let chunkCount = 0;

        // Handle stream errors
        stream.on('error', (err) => {
            reject(err);
        });

        // Handle stream finish
        stream.on('finish', () => {
            console.log(`✅ Done. Final size: ${(written / 1024 / 1024 / 1024).toFixed(2)} GB`);
            resolve();
        });

        const writeChunks = () => {
            while (written < targetSizeBytes && stream.write('')) {
                const chunkSize = getRandomInt(minChunk, maxChunk);
                const text = getRandomChunk(chunkSize) + ';'; // End with our lord and savior, the semicolon
                
                if (!stream.write(text)) {
                    // If write returns false, wait for drain event
                    stream.once('drain', writeChunks);
                    return;
                }
                
                written += Buffer.byteLength(text);
                chunkCount++;

                if (chunkCount % 1000 === 0) {
                    logger.info(`Wrote ${chunkCount} chunks... ${(written / 1024 / 1024).toFixed(2)} MB`);
                }
            }
            
            // All chunks written, end the stream
            stream.end();
        };

        writeChunks();
    });
}

const program = new Command();
program
    .name('generate-text')
    .description('Create a massive text file filled with random garbage. Your disk will hate you.')
    .argument('<size-gb>', 'Target file size in GB')
    .argument('[output-filename]', 'Output file name', 'large-text-file.txt')
    .option('--logs', 'Enable internal logging', false)
    .option('--level <level>', 'Log level: ERROR, WARN, INFO, LOG', 'INFO')
    .option('--time', 'Show timing for operation', false)
    .action(async (sizeGb, outputFilename, options) => {
        setupLogging({ logs: options.logs, level: options.level });
        const targetSizeGB = parseFloat(sizeGb);
        if (!targetSizeGB || targetSizeGB <= 0) {
            program.error('Target size must be a positive number.');
        }
        const outputFile = path.resolve(__dirname, '../../', outputFilename);
        await withTiming(
            () => generateFile(outputFile, targetSizeGB),
            options.time,
            'GenerateTextTime'
        );
    });

program.parseAsync(process.argv); 