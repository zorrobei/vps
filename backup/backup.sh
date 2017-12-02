#!/bin/bash

if [ "${1}" == "log" ]; then
	logger -p syslog.info "backup.sh is starting..."
fi

source="/etc /home /root /var/lib /var/spool/{cron,at,mail}"
target="/backups/backup-system-$(date +%Y-%m-%d).tar.gz"
[ ! -d /backups ] && mkdir /backups
tar -zcvf ${target} ${source} &> /backups/backup.log
if [ "${1}" == "log" ]; then
	logger -p syslog.info "backup.sh is finished."
fi
