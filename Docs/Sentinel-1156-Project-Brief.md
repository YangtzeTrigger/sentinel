# 🌌 SENTINEL-1156 — PROJECT BRIEF
### sentinel.aegisnet.org.uk | Discord Community Hub

**Version:** 1.0  
**Owner:** Jay Mercer  
**Domain:** sentinel.aegisnet.org.uk  
**Infrastructure:** Hetzner (self-hosted)  
**DNS:** names.co.uk  
**Status:** Pre-launch

---

## 1. PROJECT OVERVIEW

Sentinel-1156 is the web presence and bot identity for the **Server 1156 Galactic Frontier Discord community** — a neutral, cross-guild hub for all players on game Server 1156. The subdomain `sentinel.aegisnet.org.uk` serves as the public face of the Discord server, housing the landing page, legal documents, and future community tools.

The Sentinel-1156 bot acts as the server's AI sentinel — managing onboarding, moderation, and community automation under the [300] Spartans guild's stewardship, while serving all guilds of Server 1156 equally.

---

## 2. BRAND IDENTITY

| Element | Value |
|---|---|
| **Primary Name** | Sentinel-1156 |
| **Parent Brand** | AegisNet (aegisnet.org.uk) |
| **Community Name** | Server 1156 — Galactic Frontier Hub |
| **Guild** | [300] Spartans — Galactic Frontier Guild |
| **Motto** | *Three Hundred. One Purpose.* |
| **Server Motto** | *Three hundred guilds. One frontier.* |
| **Core Values** | Honour · Discipline · Unity |
| **Strategic Directives** | Hold the Line · Expand the Legacy · Honor the Oath |

### Colour Palette
| Name | Hex | Usage |
|---|---|---|
| Deep Space | `#020817` | Primary background |
| Navy Dark | `#0A1628` | Secondary background |
| Electric Blue | `#1D4ED8` | Primary accent |
| Neon Blue | `#3B82F6` | Glow / active states |
| Frontier Gold | `#D4AF37` | Headings / borders |
| Gold Bright | `#F59E0B` | CTA buttons / highlights |
| Star White | `#E2E8F0` | Body text |
| Muted Grey | `#64748B` | Secondary text |

### Typography
- **Display / Headings:** Rajdhani or Orbitron (military/sci-fi feel)
- **Body:** Exo 2 or IBM Plex Sans (clean, readable)
- **Monospace / Code:** JetBrains Mono

---

## 3. INFRASTRUCTURE

### Server
- **Provider:** Hetzner (self-hosted VPS)
- **Web Server:** Nginx (recommended) or Apache
- **SSL:** Let's Encrypt via Certbot (free, auto-renewing)

### DNS Configuration (names.co.uk)
```
Type:  A
Host:  sentinel
Value: [HETZNER_SERVER_IP]
TTL:   300
```

### Directory Structure on Server
```
/var/www/sentinel/
   index.html          ← Landing page
   terms.html          ← Terms of Service
   privacy.html        ← Privacy Policy
   /assets/
      sentinel-logo.png
      favicon.ico
```

### Nginx Virtual Host Config
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
        try_files $uri $uri/ =404;
    }
}
```

### SSL Certificate
```bash
sudo certbot --nginx -d sentinel.aegisnet.org.uk
```

---

## 4. DISCORD BOT — SENTINEL-1156

### Bot Purpose
Sentinel-1156 is the official bot of the Server 1156 Galactic Frontier Hub. It provides:
- Automated onboarding and role assignment
- Moderation and incident logging
- Cross-guild event management
- Server-wide announcements

### Discord Application URLs
| Field | URL |
|---|---|
| Terms of Service | `https://sentinel.aegisnet.org.uk/terms` |
| Privacy Policy | `https://sentinel.aegisnet.org.uk/privacy` |
| Interactions Endpoint | Leave blank (using Gateway) |
| Linked Roles URL | Phase 2 — to be configured |

### Bot Description (≤400 chars)
*SENTINEL-1156 — A futuristic Spartan sentinel merges ancient warrior heritage with deep-space technology. Glowing blue eyes pierce through battle-worn armour, flanked by a radar array scanning the frontier. Gold circuitry pulses against a star-field backdrop. Guardian of Server 1156. Honour the watch. Hold the line.*

### Bot Tags
`Sentinel-1156` `SpaceSpartan` `GalacticFrontier` `DiscordBot` `FuturisticWarrior`

---

## 5. DISCORD SERVER ARCHITECTURE SUMMARY

### Top-Level Structure
- 🔰 Arrival Gate — onboarding, rules, role selection
- 📡 Command Frequency — announcements (admin only)
- 🌐 The Agora — general community hub
- ⚔️ Frontier Ops — game-specific channels
- 🏛️ Guild Districts — role-gated guild sections
- 🎙️ Voice Sector — voice channels
- 🔒 Council Chamber — admin/mod only

### Role Tiers
**Server-wide:** Frontier Admin → Warden → Veteran Citizen → Frontier Citizen → Scout  
**Guild-specific:** Guild Leader · Guild Officer · [Guild] Member · [Guild] Recruit

### Bot Stack
| Bot | Purpose |
|---|---|
| Discord AutoMod | Native keyword/spam filtering |
| Carl-bot | Reaction roles, welcome DM, auto-mod |
| Dyno | Custom commands, backup mod, logging |
| Apollo | Event scheduling, RSVPs, reminders |
| MEE6 / Arcane | XP leveling, rank progression |

---

## 6. PHASED DELIVERY

### Phase 1 — Foundation (Now)
- [x] Discord server architecture designed
- [x] Brand identity established
- [x] Sentinel-1156 bot avatar created
- [ ] DNS A record added on names.co.uk
- [ ] Nginx vhost configured on Hetzner
- [ ] SSL certificate issued
- [ ] Landing page deployed
- [ ] ToS and Privacy Policy deployed
- [ ] Discord bot URLs updated

### Phase 2 — Bot & Automation
- [ ] Carl-bot reaction roles configured
- [ ] Discord AutoMod enabled
- [ ] Dyno custom commands set up
- [ ] Apollo events connected
- [ ] MEE6/Arcane leveling live

### Phase 3 — Community Launch
- [ ] Seed content posted in all channels
- [ ] Soft launch with trusted members
- [ ] Feedback gathered and fixes applied
- [ ] Public invite link shared across Server 1156

### Phase 4 — Expansion (Future)
- [ ] Guild registry page on sentinel.aegisnet.org.uk
- [ ] Linked Roles verification URL configured
- [ ] Custom Sentinel-1156 bot (Python/discord.py)
- [ ] Stats and leaderboard page
- [ ] Alliance treaty archive

---

## 7. LEGAL DOCUMENTS

Both documents are hosted at sentinel.aegisnet.org.uk and referenced in the Discord bot application settings.

- **Terms of Service:** `sentinel.aegisnet.org.uk/terms`
- **Privacy Policy:** `sentinel.aegisnet.org.uk/privacy`

Key points covered:
- Server 1156 Discord community usage rules
- Bot data handling (no personal data stored)
- Moderation and ban policy
- Guild district terms
- Contact information via Discord

---

## 8. CONTACTS & OWNERSHIP

| Role | Identity |
|---|---|
| Server Owner | Jay Mercer |
| Guild | [300] Spartans — Galactic Frontier Guild |
| Parent Domain | aegisnet.org.uk |
| Infrastructure | Hetzner self-hosted VPS |
| DNS | names.co.uk |

---

*Sentinel-1156 — Guardian of the Frontier. Honour the watch. Hold the line.*
