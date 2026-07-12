#!/bin/bash
# Daily restart script for multiterm-astro
# Add to crontab: 0 3 * * * /root/multiterm-astro/scripts/daily-restart.sh

LOG="/var/log/multiterm-restart.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restarting..." >> $LOG
pm2 restart multiterm-astro >> $LOG 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done." >> $LOG
