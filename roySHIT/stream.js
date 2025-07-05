const fs = require('fs');
const path = require('path');
const { mkdir } = require('fs/promises');

const ONE_GB = 1 * 1024 * 1024 * 1024;
const OUTPUT_DIR = 'output3';

async function splitFileStream(filePath) {
    await mkdir(OUTPUT_DIR, { recursive: true });

    const readStream = fs.createReadStream(filePath, { highWaterMark: ONE_GB });
    let leftover = Buffer.alloc(0);
    let counter = 1;

    readStream.on('data', async (chunk) => {
        readStream.pause(); // Pause stream to process current chunk

        try {
            const combined = Buffer.concat([leftover, chunk]);

            const lastSemiIndex = combined.lastIndexOf(';');

            if (lastSemiIndex === -1) {
                console.error(`No semicolon found in current chunk, accumulating more...`);
                leftover = combined;
            } else {
                const toWrite = combined.slice(0, lastSemiIndex + 1);
                leftover = combined.slice(lastSemiIndex + 1);

                const chunkPath = path.join(OUTPUT_DIR, `chunk_${counter}`);
                await fs.promises.writeFile(chunkPath, toWrite);

                console.log(`Written chunk #${counter}, size: ${toWrite.length} bytes`);
                counter++;
            }
        } catch (err) {
            console.error('Error processing chunk:', err);
            readStream.destroy(err);
        }

        readStream.resume(); // Continue reading
    });

    readStream.on('end', async () => {
        if (leftover.length > 0) {
            console.log(`Final leftover data of ${leftover.length} bytes, writing to last chunk.`);
            const chunkPath = path.join(OUTPUT_DIR, `chunk_${counter}`);
            await fs.promises.writeFile(chunkPath, leftover);
        }
        console.log('Finished splitting file.');
    });

    readStream.on('error', (err) => {
        console.error('Stream error:', err);
    });
}

// Usage: node script.js inputfile.txt
const [, , inputFile] = process.argv;

if (!inputFile) {
    console.error('Usage: node script.js <input-file>');
    process.exit(1);
}

splitFileStream(inputFile);

