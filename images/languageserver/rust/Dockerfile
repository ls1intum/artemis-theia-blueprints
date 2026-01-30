FROM alpine:3.22

# Standard LS port - configurable via env
ENV LS_PORT=5000

RUN apk add --no-cache socat rust-analyzer

RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /home/project && chown -R app:app /home/project

USER app
WORKDIR /home/project

EXPOSE 5000

CMD ["sh", "-c", "echo '[LS-RUST] Starting Rust Language Server on port ${LS_PORT:-5000}' && socat TCP-LISTEN:${LS_PORT:-5000},reuseaddr,fork EXEC:rust-analyzer"]
