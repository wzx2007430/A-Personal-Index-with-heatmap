#!/bin/bash
# Setup cron job for daily restart at 3:00 AM
mkdir -p /root/multiterm-astro/scripts
chmod +x /root/multiterm-astro/scripts/daily-restart.sh
(crontab -l 2>/dev/null | grep -v "daily-restart.sh"; echo "0 3 * * * /root/multiterm-astro/scripts/daily-restart.sh") | crontab -
echo "Cron job installed. Restart scheduled daily at 3:00 AM."
crontab -l | grep multiterm
