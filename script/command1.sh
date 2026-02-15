#!/bin/bash

p1=$(printf '%s' "${1}" | xargs)
p2=$(printf '%s' "${2}" | xargs)
p3=$(printf '%s' "${3}" | xargs)
p4=$(printf '%s' "${4}" | xargs)

if [ -z "${p1}" ] || [ -z "${p2}" ] || [ -z "${p3}" ] || [ -z "${p4}" ]
then
    echo "command1.sh - Missing parameter."

    exit 1
fi

parameter1="${1}"
parameter2="${2}"
parameter3="${3}"
parameter4="${4}"

"/home/squashfs-root/AppRun" --nologo --headless --convert-to "${parameter1}" "${parameter2}" --outdir "${parameter3}${parameter4}/" 2>&1 | tee -a "${PATH_ROOT}${MS_FC_PATH_LOG}debug.log"