#!/bin/bash
cat >> /etc/caddy/Caddyfile << 'EOF'

sentinel.aegisnet.org.uk {
    root * /mnt/sanctum/sentinel
    file_server
    try_files {path} {path}.html =404
    header {
        Strict-Transport-Security "max-age=31536000"
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
    }
}
EOF
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy && echo DONE
