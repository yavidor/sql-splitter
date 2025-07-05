CC = gcc
CFLAGS = -Wall -g

all: clear sql-splitter

sql-splitter: main.o 
	$(CC) $(CFLAGS) build/main.o -o dist/sql-splitter

main.o: make-dirs
	$(CC) $(CFLAGS) -c src/main.c -o build/main.o

make-dirs:
	mkdir -p build dist

clear:
	rm -rf build/ dist/ output/
