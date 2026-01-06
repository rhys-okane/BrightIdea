#!/bin/bash

SCRIPT_DIR="$(realpath $(dirname "$(readlink -f "${BASH_SOURCE[0]}")"))"
TOP_LEVEL_DIR="$(realpath "$SCRIPT_DIR/../")"


SITE_CONTAINER=$(jq -r '.staticSiteContainerName' "$TOP_LEVEL_DIR/.sst/outputs.json")
STORAGE_ACCOUNT=$(jq -r '.storageAccountName' "$TOP_LEVEL_DIR/.sst/outputs.json")
STORAGE_KEY=$(jq -r '.primaryStorageKey' "$TOP_LEVEL_DIR/.sst/outputs.json")

AZURE_STORAGE_KEY=$STORAGE_KEY az storage blob delete-batch --source $SITE_CONTAINER --account-name $STORAGE_ACCOUNT

AZURE_STORAGE_KEY=$STORAGE_KEY az storage blob upload-batch --source packages/frontend/dist --destination $SITE_CONTAINER --account-name $STORAGE_ACCOUNT