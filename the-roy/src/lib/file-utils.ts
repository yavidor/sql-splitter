import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Efficiently writes one or more buffers to a file stream without
 * merging them in memory first. Because memory is for the weak.
 * @param filePath - Path to write the file to.
 * @param datas - Buffers to write sequentially.
 */
export async function writeEfficiently(filePath: string, ...datas: Buffer[]): Promise<void> {
    const stream = fs.createWriteStream(filePath);
    const write = (data: Buffer): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!stream.write(data)) {
                stream.once('drain', resolve);
                stream.once('error', reject);
            } else {
                process.nextTick(resolve);
            }
        });
    };

    try {
        for (const data of datas) {
            if (data && data.length > 0) await write(data);
        }
    } finally {
        await new Promise<void>(resolve => stream.end(resolve));
    }
}

/**
 * Hashes a file. Don't use it for passwords, dumbass.
 * @param path - Path to the file.
 * @returns The sha256 hash.
 */
function getFileHash(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(path);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

/**
 * Checks if multiple files are byte-for-byte identical by comparing hashes.
 * @param files - File paths to compare.
 * @returns Promise<boolean>
 */
export async function areFilesEqual(...files: string[]): Promise<boolean> {
    if (files.length < 2) return true; // I guess?
    const hashes = await Promise.all(files.map(getFileHash));
    return hashes.every(h => hashes[0] === h);
}

/**
 * Reconstructs a single file from a directory of sorted chunk files.
 * @param chunksDir - The directory containing 'chunk_N' files.
 * @param outputFile - The path for the final reconstructed file.
 */
export async function reconstructFromChunks(chunksDir: string, outputFile: string): Promise<void> {
    const outputStream = fs.createWriteStream(outputFile);
    try {
        const files = await fs.promises.readdir(chunksDir);

        // Sort files numerically, not alphabetically. 'chunk_10' comes after 'chunk_9', not 'chunk_1'.
        const sortedFiles = files
            .filter(f => f.startsWith('chunk_'))
            .sort((a, b) => {
                const aNum = parseInt(a.split('_')[1], 10);
                const bNum = parseInt(b.split('_')[1], 10);
                return aNum - bNum;
            });

        for (const file of sortedFiles) {
            const filePath = path.join(chunksDir, file);
            const data = await fs.promises.readFile(filePath);
            await new Promise<void>((resolve, reject) => {
                if (!outputStream.write(data)) {
                    outputStream.once('drain', resolve);
                    outputStream.once('error', reject);
                } else {
                    resolve();
                }
            });
        }
    } finally {
        outputStream.end();
    }
} 