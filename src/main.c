#include <argp.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

#define ONE_GB (1ULL * 1024 * 1024 * 1024); // 1GiB

static char doc[] =
    "Argp example #3 -- a program with options and arguments using argp";
static char args_doc[] = "ARG1 ARG2";
static struct argp_option options[] = {
    {"verbose", 'v', 0, 0, "Produce verbose output"},
    {"quiet", 'q', 0, 0, "Don't produce any output"},
    {"silent", 's', 0, OPTION_ALIAS},
    {"output", 'o', "FILE", 0, "Output to FILE instead of standard output"},
    {0}};
struct arguments {
    char *args[2]; /* arg1 & arg2 */
    int silent, verbose;
    char *output_file;
};
error_t parse_opt(int key, char *arg, struct argp_state *state) {
    /* Get the input argument from argp_parse, which we
       know is a pointer to our arguments structure. */
    struct arguments *arguments = state->input;

    switch (key) {
    case 'q':
    case 's':
        arguments->silent = 1;
        break;
    case 'v':
        arguments->verbose = 1;
        break;
    case 'o':
        arguments->output_file = arg;
        break;

    case ARGP_KEY_ARG:
        if (state->arg_num >= 2)
            /* Too many arguments. */
            argp_usage(state);

        arguments->args[state->arg_num] = arg;

        break;

    case ARGP_KEY_END:
        if (state->arg_num < 2)
            /* Not enough arguments. */
            argp_usage(state);
        break;

    default:
        return ARGP_ERR_UNKNOWN;
    }
    return 0;
}
int main(int argc, char *argv[]) {
    struct argp argp = {options, parse_opt, args_doc, doc};
    struct arguments arguments;

    /* Default values. */
    arguments.silent = 0;
    arguments.verbose = 0;
    arguments.output_file = "-";

    argp_parse(&argp, argc, argv, 0, 0, &arguments);

    printf("ARG1 = %s\nARG2 = %s\nOUTPUT_FILE = %s\n"
           "VERBOSE = %s\nSILENT = %s\n",
           arguments.args[0], arguments.args[1], arguments.output_file,
           arguments.verbose ? "yes" : "no", arguments.silent ? "yes" : "no");

    char *fileName = argv[1];
    long int pos = 0;
    int counter = 0;
    int pFile = open(fileName, O_RDONLY);
    size_t len = ONE_GB;
    char *buffer = (char *)malloc(len); // Maximum size of a file
    mkdir("output",
          // 0755
          S_IRUSR | S_IWUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH);
    while (1) {
        counter++;

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

        memset(buffer, '0', len);
        free(outPutFileName);
        close(output);
    }
    return 0;
}
