#!/bin/bash

soffice --headless --convert-to "${1}" "${2}" --outdir "${3}"
