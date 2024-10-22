#! /usr/bin/env bash

set -uexo pipefail

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

pynadac "src/addition_division.py" -t dist
pynadac "src/simple_shares.py" -t dist

deactivate
