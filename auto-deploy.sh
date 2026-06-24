#!/bin/bash
cd /home/digisync/public_html
git fetch origin --prune
git reset --hard origin/main
git clean -fd
