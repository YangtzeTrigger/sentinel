#!/bin/bash
set -e
git clone https://github.com/YangtzeTrigger/sentinel.git /opt/sentinel
cd /opt/sentinel
npm install --omit=dev
mkdir -p data
cp scripts/sentinel-bot.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable sentinel-bot
echo "DONE — bot installed and enabled"
