CC = gcc
CFLAGS = -Wall -Wextra -g

TARGET = main
SRCS = main.c

$(TARGET): $(SRCS)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRCS)

clean:
	rm -f $(TARGET)

.PHONY: clean
