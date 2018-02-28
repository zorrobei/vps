#!/bin/bash
# Program:
#	The program saves the necessary data of your server.

PATH=/bin:/usr/bin:/usr/sbin:/usr/local/bin
export PATH

basedir=/backups
settings="/etc /usr/local "
users="/root /home /var/spool/{cron, at, maila} "
mongodb=/var/lib/mongo
sources=$settings$users$mongodb
target="$basedir/backup-$(date +%Y-%m-%d).tar.bz2"

[ -d $basedir ] || mkdir $basedir

if [ "${1}" == "log" ]; then
	tar -cjpvf $target $sources &> $basedir/backup.log
else
	tar -cjpf $target $sources
fi
