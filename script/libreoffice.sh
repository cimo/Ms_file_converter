#!/bin/bash

eval "$(dbus-launch --auto-syntax)"

export NO_AT_BRIDGE=1

"/home/squashfs-root/AppRun"
