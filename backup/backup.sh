#!/bin/bash
# Program:
#	The program saves the necessary data of your server.

PATH=/bin:/usr/bin:/usr/sbin:/usr/local/bin
export PATH

basedir=/var/backups
settings="/etc "
users="/root /home "
data="/var "
excludes="/var/cache /var/run /var/tmp "$basedir
sources=$settings$users$data
target="$basedir/backup-$(date +%F).tar.xz"

[ -d $basedir ] || mkdir $basedir

if [ "${1}" == "log" ]; then
	tar -cJpvf $target --exclude=$excludes $sources &> $basedir/backup.log
else
	tar -cJpf $target --exclude=$excludes $sources
fi