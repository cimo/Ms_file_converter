#!/bin/bash

pathOutput="${PATH_ROOT}${MS_FC_PATH_FILE}output/"

currentTime=$(date +%s)

for data in "${pathOutput}"*/
do
    if [ -d "${data}" ]
    then
        statData=$(stat -c %Y "${data}")
        time=$((${currentTime} - ${statData}))

        if [ ${time} -gt 600 ]
        then
            rm -rf "${data}"

            echo "Folder '${data}' removed."
        fi
    fi
done
