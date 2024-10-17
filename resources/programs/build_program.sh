#! /usr/bin/env bash

set -uexo pipefail

SRC="$1"

source venv/bin/activate
pynadac "${SRC}" -t dist
deactivate
