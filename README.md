# SQL Splitter

Splits an n GB sql file (or any file with a semicolon delimiter) to (around) n files each weighing (about) GB

## How to run
- Clone this repository
- Run `make`
- Run `./dist/sql-splitter ${MY_FILE}` with the file you want to split
- The chunks of the file will be present in the output directory

### TODOS
- [ ] Add command line arguments/flags

