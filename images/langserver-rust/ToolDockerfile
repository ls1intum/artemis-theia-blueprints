FROM alpine:3.22

RUN apk update && apk add --no-cache socat rust-analyzer cargo busybox-extras

RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /home/project && chown -R app:app /home/project

USER app
WORKDIR /home/project

CMD ["socat", "TCP-LISTEN:5555,reuseaddr,fork", "EXEC:rust-analyzer"]