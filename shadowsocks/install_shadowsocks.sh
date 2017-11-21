#!/bin/bash
# Program:
#	Program gets the latest source code form github, then builds and installs the necessary dependencies before installing the shadowsocks-libev.
# Thanks:
#	Clow Windy <clowwindy42@gmail.com>
#	Max Lv <max.c.lv@gmail.com>
# Histroy:
# 2017/11/21	Zorro Bei	First release
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export PATH

# Getting the latest source code
git clone https://github.com/shadowsocks/shadowsocks-libev.git
cd shadowsocks-libev
git submodule update --init --recursive

# Installation of basic build dependencies
if [ "$1" == "centos" -o "$1" == "fedora" -o "$1" == "rhel" ]; then
	sudo yum install gettext gcc autoconf libtool automake make asciidoc xmlto c-ares-devel libev-devel pcre-devel
elif [ "$1" == "debian" -o "$1" == "ubuntu" ]; then
	sudo apt-get install --no-install-recommends gettext build-essential autoconf libtool libpcre3-dev asciidoc xmlto libev-dev libc-ares-dev automake libmbedtls-dev libsodium-dev
elif [ "$1" == "arch" ]; then
	sudo pacman -S gettext gcc autoconf libtool automake make asciidoc xmlto c-ares libev
else
	echo "Usage: $0 [centos|fefora|rhel|debian|ubuntu|arch]"
	exit 1
fi

# Installation of Libsodium
export LIBSODIUM_VER=1.0.13
wget https://download.libsodium.org/libsodium/releases/libsodium-$LIBSODIUM_VER.tar.gz
tar xvf libsodium-$LIBSODIUM_VER.tar.gz
pushd libsodium-$LIBSODIUM_VER
./configure --prefix=/usr && make
sudo make install
popd
sudo ldconfig

# Installation of MbedTLS
export MBEDTLS_VER=2.6.0
wget https://tls.mbed.org/download/mbedtls-$MBEDTLS_VER-gpl.tgz
tar xvf mbedtls-$MBEDTLS_VER-gpl.tgz
pushd mbedtls-$MBEDTLS_VER
make SHARED=1 CFLAGS=-fPIC
sudo make DESTDIR=/usr install
popd
sudo ldconfig

# Start building
./autogen.sh && ./configure && make
sudo make install
