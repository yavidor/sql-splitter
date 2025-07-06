# Roy's Disk Space Hater CLI

A collection of TypeScript CLI tools for when you hate your disk space. Built with Commander.js for robust argument parsing and help.

## Features

- **Generate massive text files** filled with random garbage
- **Create gigantic SQLite databases** that will make your disk cry
- **Split files at semicolon boundaries** with backpressure and concurrency
- **Reconstruct files from chunks** (actually works, surprisingly)
- **Compare files byte-for-byte** using SHA256 hashes
- **Built-in logging and timing** for debugging and performance monitoring

## Installation

```bash
npm install
npm run build
```

## Usage

All commands support these global flags:
- `--logs` - Enable internal logging (default: off)
- `--level <level>` - Log level: ERROR, WARN, INFO, LOG (default: INFO)
- `--time` - Show timing for operations
- `--help` - Show help for any command

## Commands

### Generate Text File
```bash
npm run dev:generate:text <size-gb> [filename] [flags]
# Example: Create a 1GB text file
npm run dev:generate:text 1 huge.txt --logs --level LOG --time
```

### Generate SQLite Database
```bash
npm run dev:generate:sql <size-gb> [filename] [flags]
# Example: Create a 5GB database
npm run dev:generate:sql 5 monster.db --time
```

### Split File
```bash
npm run dev:split <input-file> [output-dir] [flags]
# Example: Split a file into chunks
npm run dev:split huge.txt chunks --time
```

### Reconstruct File
```bash
npm run dev:reconstruct <chunks-dir> <output-file> [flags]
# Example: Rebuild from chunks
npm run dev:reconstruct chunks reconstructed.txt --time
```

### Compare Files
```bash
npm run dev:compare <file1> <file2> [flags]
# Example: Compare original and reconstructed
npm run dev:compare original.txt reconstructed.txt --time
```

## Log Levels

- **ERROR** - Only show errors (quietest)
- **WARN** - Show warnings and errors
- **INFO** - Show info, warnings, and errors (default)
- **LOG** - Show everything including debug info (most verbose)

## Examples

```bash
# Generate a 1GB text file with full logging and timing
npm run dev:generate:text 1 test.txt --logs --level LOG --time

# Split it into chunks with warnings only
npm run dev:split test.txt chunks --logs --level WARN --time

# Reconstruct and compare silently (no logs)
npm run dev:reconstruct chunks reconstructed.txt --time
npm run dev:compare test.txt reconstructed.txt --time

# Create a massive 5GB database (your disk will cry)
npm run dev:generate:sql 5 test.db --logs --time
```

## Development

```bash
# Build the project
npm run build

# Run commands in development mode (TypeScript)
npm run dev:generate:text 1 test.txt --time

# Run commands in production mode (compiled JavaScript)
npm run generate:text 1 test.txt --time
```

## Tips

- Use `--time` to see how long operations take
- Use `--logs --level LOG` for maximum verbosity when debugging
- Use `--level ERROR` for quiet operation
- These tools are designed to be memory-efficient for large files
- Don't blame us if you run out of disk space

## Help

Get detailed help for any command:
```bash
npm run dev:generate:text -- --help
npm run dev:split -- --help
npm run dev:compare -- --help
```

Remember: With great power comes great responsibility to your disk space.

---

**Author**: Roy (the disk space hater)  
**License**: ISC

