#!/bin/bash
set -e

BOT_DIR="/opt/sentinel"
SERVICE="sentinel-bot"

echo "[1/5] Cloning repo..."
if [ -d "$BOT_DIR/.git" ]; then
  git -C "$BOT_DIR" pull
  echo "  Already exists — pulled latest."
else
  git clone https://github.com/YangtzeTrigger/sentinel.git "$BOT_DIR"
fi

echo "[2/5] Installing dependencies..."
cd "$BOT_DIR"
npm install --omit=dev

echo "[3/5] Creating data directory..."
mkdir -p "$BOT_DIR/data"

echo "[4/5] Installing systemd service..."
cp "$BOT_DIR/scripts/sentinel-bot.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable "$SERVICE"

echo ""
echo "========================================="
echo "  Bot deployed. ONE STEP REMAINING:"
echo "  Create the .env file before starting:"
echo ""
echo "  nano $BOT_DIR/.env"
echo ""
echo "  Add these three lines:"
echo "  DISCORD_TOKEN=your_token_here"
echo "  APPLICATION_ID=your_app_id_here"
echo "  ANTHROPIC_API_KEY=your_key_here"
echo ""
echo "  Then start the bot:"
echo "  systemctl start $SERVICE"
echo "  journalctl -u $SERVICE -f"
echo "========================================="
