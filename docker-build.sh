#!/bin/bash

TAG_NANE="$(git rev-parse --short=12 HEAD)"
echo "TAG_NANE=$TAG_NANE"

docker build -t bosagora/bosagora-foundations-api:"$TAG_NANE" -f Dockerfile --push .

