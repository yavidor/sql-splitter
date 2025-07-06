import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import PQueue from 'p-queue';
import { ONE_GB, SEMI_COLON_ASCII } from '../lib/constants.js';
import { writeEfficiently } from '../lib/file-utils.js';
import * as logger from '../lib/logger-utils.js';
import { setupLogging, withTiming } from '../lib/cli-utils.js';

async function splitFile(filePath: string, outputDir: string = 'output'): Promise<void> {
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Concurrency settings. Tweak if you feel lucky.
    const WRITE_CONCURRENCY = 32;
    const READ_BACKPRESSURE_LIMIT = WRITE_CONCURRENCY * 2;
    const writeQueue = new PQueue({ concurrency: WRITE_CONCURRENCY });

    let fileHandle: fs.promises.FileHandle | undefined;
    try {
        fileHandle = await fs.promises.open(filePath, 'r');
        const readStream = fileHandle.createReadStream({ highWaterMark: ONE_GB });

        let leftover = Buffer.alloc(0);
        let chunkCounter = 1;

        // This is the core backpressure mechanism. It stops the when the bucket is full.
        const checkAndResume = (): void => {
            if (readStream.isPaused() && writeQueue.size < READ_BACKPRESSURE_LIMIT) {
                readStream.resume();
            }
        };

        writeQueue.on('completed', checkAndResume);
        writeQueue.on('error', (error: Error) => {
            console.error("A write task failed:", error);
            readStream.destroy(); // Stop this madness.
        });

        for await (const chunk of readStream) {
            let lastSemiIndex = chunk.lastIndexOf(SEMI_COLON_ASCII);
            if (lastSemiIndex === -1) {
                leftover = Buffer.concat([leftover, chunk]);
                logger.warn(`No semicolon in ${chunk.length / 1024 / 1024}MB chunk. This is getting out of hand.`);
                continue;
            }

            const currentChunkToWrite = chunk.subarray(0, lastSemiIndex + 1);
            const outputPath = path.join(outputDir, `chunk_${chunkCounter}`);

            const leftoverForThisWrite = leftover;
            writeQueue.add(() => writeEfficiently(outputPath, leftoverForThisWrite, currentChunkToWrite));

            leftover = chunk.subarray(lastSemiIndex + 1);
            chunkCounter++;

            if (writeQueue.size >= READ_BACKPRESSURE_LIMIT) {
                readStream.pause();
            }
        }

        if (leftover.length > 0) {
            logger.info(`Writing final leftover garbage of ${leftover.length} bytes.`);
            const outputPath = path.join(outputDir, `chunk_${chunkCounter}`);
            writeQueue.add(() => writeEfficiently(outputPath, leftover));
        }

        await writeQueue.onIdle();
        logger.info('All write operations have been queued and hopefully completed.');

    } catch (err) {
        console.error('An error occurred. Surprise, surprise.', err);
    } finally {
        await fileHandle?.close();
    }
}

const program = new Command();
program
    .name('split')
    .description('Split a file into chunks at semicolon boundaries. Uses backpressure and concurrency because we\'re not savages.')
    .argument('<input-file>', 'Input file to split')
    .argument('[output-dir]', 'Output directory for chunks', 'output')
    .option('--logs', 'Enable internal logging', false)
    .option('--level <level>', 'Log level: ERROR, WARN, INFO, LOG', 'INFO')
    .option('--time', 'Show timing for operation', false)
    .action(async (inputFile, outputDir, options) => {
        setupLogging({ logs: options.logs, level: options.level });
        await withTiming(
            () => splitFile(inputFile, outputDir),
            options.time,
            'TotalSplitTime'
        );
    });

program.parseAsync(process.argv); 