const fs = require('fs');
const path = require('path');
const { mkdir, stat } = require('fs/promises');

const ONE_GB = 1 * 1024 * 1024 * 1024; // 1 GiB
const OUTPUT_DIR = 'output2';

async function splitFile(filePath) {
    await mkdir(OUTPUT_DIR, { recursive: true });

    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;

    let position = 0;
    let counter = 1;

    const fd = await fs.promises.open(filePath, 'r');

    try {
        while (position < fileSize) {
            const buffer = Buffer.alloc(Math.min(ONE_GB, fileSize - position));
            const { bytesRead } = await fd.read(buffer, 0, buffer.length, position);

            if (bytesRead <= 0) break;

            // Search for last semicolon in this buffer
            const lastSemiIndex = buffer.lastIndexOf(';');

            if (lastSemiIndex === -1) {
                console.error(`No semicolon found in chunk starting at position ${position}`);
                break;
            }

            const chunkBuffer = buffer.slice(0, lastSemiIndex + 1);

            const chunkPath = path.join(OUTPUT_DIR, `chunk_${counter}`);
            await fs.promises.writeFile(chunkPath, chunkBuffer);

            console.log(`Written chunk #${counter}, size: ${chunkBuffer.length} bytes`);

            position += lastSemiIndex + 1;
            counter++;
        }

        console.log('Finished splitting file.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await fd.close();
    }
}

// Example usage: node script.js inputfile.txt
const [, , inputFile] = process.argv;

if (!inputFile) {
    console.error('Usage: node script.js <input-file>');
    process.exit(1);
}

splitFile(inputFile);

