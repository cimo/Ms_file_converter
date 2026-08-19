#!/bin/bash

p1=$(printf '%s' "${1}" | xargs)
p2=$(printf '%s' "${2}" | xargs)
p3=$(printf '%s' "${3}" | xargs)
p4=$(printf '%s' "${4}" | xargs)

if [ "$#" -lt 4 ] || [ -z "${p1}" ] || [ -z "${p2}" ] || [ -z "${p3}" ] || [ -z "${p4}" ]
then
    echo -e "\n❌ command1.sh - Missing parameter."

    exit 1
fi

parameter1="${p1}"
parameter2="${p2}"
parameter3="${p3}"
parameter4="${p4}"

pathOutput="${parameter3}${parameter4}/"

extension="${parameter2##*.}"
basename=$(basename "${parameter2%.*}")

filterPdf="pdf"

if [ "${extension}" = "xlsx" ]
then
    filterPdf='pdf:calc_pdf_Export:{"SinglePageSheets":{"type":"boolean","value":"true"}}'
fi

if [ "${parameter1}" = "pdf" ]
then
    "/home/squashfs-root/AppRun" --norestore --nologo --headless --convert-to "${filterPdf}" "${parameter2}" --outdir "${pathOutput}" 2>&1 | tee -a "${PATH_ROOT}${MS_FC_PATH_LOG}debug.log"
elif [ "${parameter1}" = "jpg" ]
then
    if [ "${extension}" = "pdf" ]
    then
        mkdir -p "${pathOutput}"

        cp "${parameter2}" "${pathOutput}${basename}.pdf"

        echo "Copy pdf" | tee -a "${PATH_ROOT}${MS_FC_PATH_LOG}debug.log"
    else
        "/home/squashfs-root/AppRun" --norestore --nologo --headless --convert-to "${filterPdf}" "${parameter2}" --outdir "${pathOutput}" 2>&1 | tee -a "${PATH_ROOT}${MS_FC_PATH_LOG}debug.log"
    fi

    pdftoppm -jpeg -r 150 "${pathOutput}${basename}.pdf" "${pathOutput}${basename}" 2>&1 | tee -a "${PATH_ROOT}${MS_FC_PATH_LOG}debug.log"
fi
