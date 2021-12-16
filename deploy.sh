#!/bin/bash

mkdir -p build
rm build/* 
zip --exclude '.git*' --exclude 'bin/darwin*' --exclude 'deploy.sh' --exclude 'build/*' --exclude 'events/*'  -r build/current.zip .
aws lambda update-function-code --function-name nana-api  --zip-file fileb:///`pwd`/build/current.zip
version=`aws lambda publish-version --function-name nana-api | jq -r .Version`
aws lambda update-alias --function-name nana-api --function-version $version --name production
