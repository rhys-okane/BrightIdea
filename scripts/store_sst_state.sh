#!/bin/bash
set -e

SST_CONFIG=$(yarn sst version --verbose | grep config | awk '{split($0,a," "); print a[2]}')
mkdir -p $SST_CONFIG/state/app/brightidea
mkdir -p $SST_CONFIG/state/passphrase/brightidea


az storage blob upload --account-name brightideacistate --container-name sst-state --name "state/app/brightidea/$SST_STAGE.json" --file "$SST_CONFIG/state/app/brightidea/$SST_STAGE.json" --overwrite
az storage blob upload --account-name brightideacistate --container-name sst-state --name "state/passphrase/brightidea/$SST_STAGE.json" --file "$SST_CONFIG/state/passphrase/brightidea/$SST_STAGE.json" --overwrite