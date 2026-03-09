#!/bin/bash

path="${PATH_ROOT}${MS_FC_PATH_FILE}output/"

currentTime=$(date +%s)

for data in "${path}"*
do
    if [ -e "${data}" ]
    then
        statData=$(stat -c %Y "${data}")
        time=$((${currentTime} - ${statData}))

        if [ ${time} -gt 600 ]
        then
            if [ -d "${data}" ]
            then
                rm -rf "${data}"

                echo "Folder '${data}' deleted."
            else
                rm -f "${data}"
                
                echo "File '${data}' deleted."
            fi
        fi
    fi
done
