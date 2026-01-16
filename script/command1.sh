#!/bin/bash

"/home/squashfs-root/AppRun" --headless --convert-to "${1}" "${2}" --outdir "${3}${4}/" > /dev/null 2>&1 &
