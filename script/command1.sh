#!/bin/bash

"/home/squashfs-root/AppRun" --headless --convert-to "${1}" "${2}" --outdir "${3}${4}/" 2>&1 | tee -a "${PATH_ROOT}${MS_FC_PATH_LOG}debug.log"