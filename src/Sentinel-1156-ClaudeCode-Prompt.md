# CLAUDE CODE — SENTINEL-1156 MASTER BUILD PROMPT
### Feed this entire document to Claude Code to begin the build

---

## CONTEXT & MISSION

You are building the **Sentinel-1156** Discord bot and web infrastructure for the **Server 1156 Galactic Frontier Hub** — a community Discord server for the mobile strategy game **Foundation: Galactic Frontier**, hosted on a Hetzner self-managed VPS.

The subdomain is `sentinel.aegisnet.org.uk`. DNS is managed via names.co.uk and already points to this server. The parent domain is `aegisnet.org.uk`.

The brand aesthetic is: **deep space, black, gold (#D4AF37), electric blue (#3B82F6)**. Military/sci-fi tone. The community is called the Galactic Frontier Hub and serves ALL guilds on game Server 1156 — not just one guild. The owner's guild is [300] Spartans.

---

## PHASE 1 — WEB INFRASTRUCTURE

### 1.1 Check existing server state
```
- Check if Nginx or Apache is running
- Check if Certbot/Let's Encrypt is installed
- Check if /var/www/ exists and what's in it
- Check open ports (80, 443)
- Report findings before proceeding
```

### 1.2 Create web directory
```
mkdir -p /var/www/sentinel
mkdir -p /var/www/sentinel/assets
```

### 1.3 Deploy HTML files
Deploy the following three files to /var/www/sentinel/:
- index.html (landing page — already built, see notes)
- terms.html (Terms of Service — already built)
- privacy.html (Privacy Policy — already built)

If files are not present, rebuild them using the brand spec above.
Key content for index.html:
- Hero: "SENTINEL-1156 | Guardian of the Frontier"
- Tagline: "Three hundred guilds. One frontier."
- Discord invite button (placeholder: https://discord.gg/INVITE — ask owner for real link)
- Features: Cross-Guild Community, Frontier Ops, Sentinel Bot, Honour the Code, Live Intel, Rank & Progress
- Footer links to /terms and /privacy
- Colour palette: deep-space #020817, gold #D4AF37, electric blue #3B82F6
- Fonts: Orbitron (headings), Exo 2 (body) — Google Fonts

### 1.4 Configure Nginx virtual host
Create /etc/nginx/sites-available/sentinel with:
```nginx
server {
    listen 80;
    server_name sentinel.aegisnet.org.uk;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name sentinel.aegisnet.org.uk;
    ssl_certificate /etc/letsencrypt/live/sentinel.aegisnet.org.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sentinel.aegisnet.org.uk/privkey.pem;
    root /var/www/sentinel;
    index index.html;
    location / {
        try_files $uri $uri/ $uri.html =404;
    }
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/sentinel /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 1.5 SSL Certificate
```bash
certbot --nginx -d sentinel.aegisnet.org.uk --non-interactive --agree-tos -m [ASK OWNER FOR EMAIL]
```
If certbot is not installed:
```bash
apt install certbot python3-certbot-nginx -y
```

### 1.6 Verify deployment
- curl https://sentinel.aegisnet.org.uk and confirm 200 response
- curl https://sentinel.aegisnet.org.uk/terms and confirm 200
- curl https://sentinel.aegisnet.org.uk/privacy and confirm 200
- Report SSL certificate expiry date

---

## PHASE 2 — DISCORD BOT (Sentinel-1156)

### 2.1 Bot stack decision
Ask the owner: "Do you want to build a custom Python bot, or configure existing bots (Carl-bot, Dyno, Apollo, MEE6)?"

If custom bot — proceed with Phase 2.2
If existing bots only — skip to Phase 3 (Discord server setup guide)

### 2.2 Custom bot setup (Python/discord.py)
```bash
# Create bot directory
mkdir -p /opt/sentinel-bot
cd /opt/sentinel-bot

# Python environment
python3 -m venv venv
source venv/bin/activate
pip install discord.py python-dotenv aiohttp

# Create .env file (ask owner for token)
cat > .env << 'EOF'
DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
GUILD_ID=YOUR_SERVER_ID_HERE
LOG_CHANNEL_ID=YOUR_LOG_CHANNEL_ID
EOF
```

### 2.3 Bot core file (bot.py)
Create /opt/sentinel-bot/bot.py with the following features:

**On ready:**
- Log startup to console with timestamp
- Set bot status to: "Watching the Frontier | Server 1156"

**Commands (prefix: !):**
- `!rules` — posts the Frontier Codex rules embed
- `!guilds` — posts list of registered guilds
- `!recruit` — posts recruitment board format template
- `!intel` — posts link to fgfwiki.com
- `!ping` — latency check
- `!sentinel` — posts bot info embed with links to sentinel.aegisnet.org.uk

**Events:**
- `on_member_join` — sends welcome DM:
  "Welcome to Server 1156 — Galactic Frontier Hub, {username}. 
   Head to #choose-your-path to get your role and access the frontier.
   Rules: #oath-and-law | Help: #how-to-navigate
   Three hundred guilds. One purpose."

- `on_member_remove` — logs departure to mod log channel

**Auto-moderation:**
- Block messages containing invite links from members with Scout role
- Anti-spam: warn on 5+ identical messages within 10 seconds
- Log all auto-mod actions to mod log channel

**Embeds:**
- All embeds use colour #D4AF37 (gold)
- Footer: "Sentinel-1156 | Guardian of the Frontier"
- Thumbnail: bot avatar

### 2.4 Systemd service for bot
Create /etc/systemd/system/sentinel-bot.service:
```ini
[Unit]
Description=Sentinel-1156 Discord Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/sentinel-bot
ExecStart=/opt/sentinel-bot/venv/bin/python bot.py
Restart=always
RestartSec=10
EnvironmentFile=/opt/sentinel-bot/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl daemon-reload
systemctl enable sentinel-bot
systemctl start sentinel-bot
systemctl status sentinel-bot
```

---

## PHASE 3 — DISCORD SERVER SETUP GUIDE

### 3.1 Generate a complete setup checklist
Produce a step-by-step Discord server build guide the owner can follow, covering:

**Categories and channels to create (in order):**
```
🔰 ― ARRIVAL GATE ―
  #frontier-beacon      (read-only, all)
  #oath-and-law         (read-only, all)
  #how-to-navigate      (read-only, all)
  #choose-your-path     (Scouts can post here only)

📡 ― COMMAND FREQUENCY ―
  #high-command-dispatch  (admin post only)
  #patch-intel            (admin post only)
  #event-broadcasts       (admin post only)
  #server-1156-news       (admin post only)

🌐 ― THE AGORA ―
  #open-comms
  #frontier-lounge
  #introductions
  #media-uplink
  #poll-station

⚔️ ― FRONTIER OPS ―
  #server-1156-intel
  #battle-reports
  #trade-post
  #recruitment-board
  #alliance-table

🏛️ ― GUILD DISTRICTS ―
  (template per guild — see below)

🎙️ ― VOICE SECTOR ―
  🔊 Open Comms
  🔊 War Table
  🔊 Frontier Lounge
  🔊 Command Bridge (admin/warden only)

🔒 ― COUNCIL CHAMBER ―
  #moderator-ops
  #incident-log
  #bot-control
  #server-development
```

**Guild District template (repeat per guild):**
```
⚔️ [GUILD NAME]
  #guild-command    (officers post, members read)
  #guild-ops        (members post)
  #guild-lounge     (members post)
  #war-room         (members post)
  🔊 Guild Voice
```

**Roles to create (top to bottom):**
```
⚡ Frontier Admin     #F59E0B   (all permissions)
🛡️ Warden            #3B82F6   (mod permissions)
🤖 Bot               #374151   (bot role)
🌟 Veteran Citizen   #94A3B8   (level 5 reward)
⚔️ Frontier Citizen  #E2E8F0   (verified members)
👁️ Scout             #64748B   (new arrivals)
[300] Spartiate      #D4AF37   (guild role)
[300] Recruit        #92700A   (guild role)
Guild Leader         #F59E0B   (cosmetic)
Guild Officer        #94A3B8   (cosmetic)
```

**Permission matrix:**
```
Arrival Gate:    @everyone=view only | Scout=view+post in #choose-your-path
Command Freq:    Citizen=view | Admin=post
Agora/Ops:       Citizen=view+post | Scout=hidden
Guild Districts: Guild role only | Admin/Warden always on
Council Chamber: Admin+Warden only
Command Bridge:  Admin+Warden only
```

### 3.2 Generate channel content
Write the following ready-to-paste Discord messages:

**#frontier-beacon welcome post:**
A 3-paragraph server purpose statement. Neutral tone. Cover: what Foundation: Galactic Frontier Server 1156 is, what this Discord hub is for, and an open invitation to all guilds to claim a district. End with the Discord invite link placeholder and a link to sentinel.aegisnet.org.uk.

**#oath-and-law Frontier Codex:**
10 numbered rules formatted for Discord. Spartan/military tone. Cover: respect, no harassment, no spam, guild rivalry stays in-game, no doxxing, no illegal content, follow Discord ToS, moderation is final, guild leaders are responsible for their district, the server is neutral ground.

**#how-to-navigate guide post:**
Simple step-by-step. Scout → choose path → introduce yourself → access guild district. Use Discord channel mentions format (#channel-name).

**#recruitment-board template:**
A formatted template guild leaders paste when recruiting. Fields: Guild Name, Server, Guild Level, Members, Requirements, Playstyle, Contact.

**#server-1156-intel first post:**
A pinned starter post linking to fgfwiki.com, the official foundation.game guides, and BlueStacks guides. Frame it as the Frontier Intelligence Briefing.

---

## PHASE 4 — VERIFICATION & HANDOVER

### 4.1 Final checks
- [ ] sentinel.aegisnet.org.uk loads correctly over HTTPS
- [ ] /terms and /privacy pages load
- [ ] SSL certificate is valid and auto-renewing
- [ ] Nginx config passes nginx -t
- [ ] Bot is running (if built) — systemctl status sentinel-bot
- [ ] Bot responds to !ping in Discord

### 4.2 Report to owner
Produce a final summary report covering:
- What was built and deployed
- Any items that need the owner's input (Discord token, invite link, email for SSL)
- What still needs to be done manually in Discord
- Any errors encountered and how they were resolved

### 4.3 Items requiring owner input
Claude Code cannot complete these — flag them clearly:
- Discord bot token (from Discord Developer Portal)
- Discord server ID
- Real Discord invite link (replace all YOUR_INVITE placeholders)
- Email address for SSL certificate registration
- Sentinel-1156 bot avatar image (upload to /var/www/sentinel/assets/)
- Confirmation of Nginx vs Apache

---

## REFERENCE: BRAND & CONTENT SPEC

### Colour palette
```
Deep Space:     #020817
Navy Dark:      #0A1628
Electric Blue:  #1D4ED8
Neon Blue:      #3B82F6
Frontier Gold:  #D4AF37
Gold Bright:    #F59E0B
Star White:     #E2E8F0
Muted:          #64748B
```

### Key URLs
```
Landing page:   https://sentinel.aegisnet.org.uk
Terms:          https://sentinel.aegisnet.org.uk/terms
Privacy:        https://sentinel.aegisnet.org.uk/privacy
Parent domain:  https://aegisnet.org.uk
Game wiki:      https://fgfwiki.com
Official game:  https://www.foundation.game
```

### Bot identity
```
Name:        Sentinel-1156
Description: Guardian of Server 1156. Watches the frontier so you don't have to.
Status:      Watching the Frontier | Server 1156
Prefix:      !
Colour:      #D4AF37
Footer:      Sentinel-1156 | Guardian of the Frontier
ToS URL:     https://sentinel.aegisnet.org.uk/terms
Privacy URL: https://sentinel.aegisnet.org.uk/privacy
```

### Server identity
```
Server name:   Server 1156 | Galactic Frontier
Description:   The neutral hub for all guilds of Server 1156.
               Three hundred guilds. One frontier.
Owner guild:   [300] Spartans — Galactic Frontier Guild
Motto:         Three Hundred. One Purpose.
Values:        Honour · Discipline · Unity
Directives:    Hold the Line · Expand the Legacy · Honor the Oath
Game:          Foundation: Galactic Frontier (FunPlus/SkyDance Games)
```

---

## INSTRUCTIONS FOR CLAUDE CODE

1. Start with Phase 1 — check the server state before doing anything
2. Report findings and confirm with owner before making system changes
3. Ask for missing values (token, email, invite link) rather than using placeholders where possible
4. Work through phases sequentially — do not skip ahead
5. After each phase, confirm success and ask before proceeding to the next
6. Keep a running log of everything created, modified, or installed
7. If anything fails, diagnose and report clearly before attempting a fix
8. Final deliverable: a clean handover report the owner can save for reference
