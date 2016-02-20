#!/bin/bash
echo "$1"
echo "$2"
google-chrome-stable 'http://localhost:3000/?id='$1'&proxyid='$2 &> /dev/null &
