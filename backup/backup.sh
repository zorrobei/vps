#!/bin/bash
# Program:
#	The program saves the necessary data of your server.
# History:
# 2017/12/04	Zorro Bei	v0.0.1
#	First release.
# 2017/12/05	Zorro Bei	v0.0.2
#	Saving the files through bzip2.
#	Don't log files saved as default. If you want to save the log, use the parameter log.

PATH=/bin:/sbin;/usr/bin;/usr/sbin:/usr/local/bin:/usr/local/sbin
export PATH

basedir=/backups
source="/etc /home /root /var/lib /var/spool/{cron,at,mail}"
target="${basedir}/backup-data-$(date +%Y-%m-%d).tar.gz"

if [ "${1}" == "log" ]; then
	tar -cjpvf ${target} ${source} &> ${basedir}/backup.log
else
	tar -cjpf ${target} ${source}
fi
