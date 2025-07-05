#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    char *fileName = argv[1];
    long int pos = 0;
    int counter = 0;
    int pFile = open(fileName, O_RDONLY);
    size_t len = 1 * 1024 * 1024 * 1024; // 1GiB
    mkdir("output",
          // 0755
          S_IRUSR | S_IWUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH);
    while (1) {
        counter++;
        char *buffer = (char *)malloc(len); // Maximum size of a file

        int bytesRead = pread(pFile, buffer, len, pos);

        // Finished reading the file
        if (bytesRead <= 0) {
            close(pFile);
            free(buffer);
            if (bytesRead == 0) {
                printf("FINISHED!\n");
                return EXIT_SUCCESS;
            }
            printf("ERROR! %d\n", bytesRead);
            return EXIT_FAILURE;
        }

        // Get the last semicolon (;) in the buffer
        int bytesTillSemi;
        for (int i = bytesRead; i >= 0; i--) {
            if (buffer[i] == ';') {
                bytesTillSemi = i;
                break;
            }
        }
        pos += bytesTillSemi + 2;

        // output/chunk_{number}, 14 bytes for 'output/chunk_' and 10 bytes for
        // maximum length of an int in characters
        char *outPutFileName = (char *)malloc(sizeof(char) * 14 + 10);
        sprintf(outPutFileName, "output/chunk_%d", counter);

        int output = open(outPutFileName, O_WRONLY | O_APPEND | O_CREAT,
                          // 0644
                          S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH);
        int written = write(output, buffer, bytesTillSemi + 2);
        if (written != bytesTillSemi + 2) {
            printf("Written %d bytes instead of %d to file %s\n", written,
                   bytesTillSemi + 2, outPutFileName);
        }
        printf("Written chunk #%d\n", counter);

        close(output);
        free(buffer);
        free(outPutFileName);
    }
    return 0;
}
