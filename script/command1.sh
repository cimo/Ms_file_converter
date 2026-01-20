#!/bin/bash

"/home/squashfs-root/AppRun" --headless --convert-to "${1}" "${2}" --outdir "${3}${4}/" >> ${PATH_ROOT}${MS_FC_PATH_LOG}libreoffice.log 2>&1 &
