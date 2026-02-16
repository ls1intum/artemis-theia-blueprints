FROM alpine:3.22

ENV LS_PORT=5000
ENV WORKSPACE_PATH=/home/project

RUN apk add --no-cache socat rust-analyzer rust cargo

RUN addgroup -g 101 -S app && adduser -u 101 -S app -G app
RUN mkdir -p /home/project && chown -R app:app /home/project

USER app
WORKDIR /home/project

EXPOSE 5000

CMD sh -c 'echo "[LS-RUST] Starting Rust Language Server on port ${LS_PORT:-5000} with workspace ${WORKSPACE_PATH:-/home/project}" && cd ${WORKSPACE_PATH:-/home/project} && socat TCP-LISTEN:${LS_PORT:-5000},reuseaddr,fork EXEC:rust-analyzer'
