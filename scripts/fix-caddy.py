with open('/etc/caddy/Caddyfile', 'r') as f:
    content = f.read()

# Remove everything from the first sentinel block onwards
cut = content.find('\nsentinel.aegisnet.org.uk')
if cut == -1:
    cut = content.find('sentinel.aegisnet.org.uk')
clean = content[:cut].rstrip()

clean += """

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
"""

with open('/etc/caddy/Caddyfile', 'w') as f:
    f.write(clean)

print("Caddyfile updated cleanly.")
