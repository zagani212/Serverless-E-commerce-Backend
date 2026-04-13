#!/bin/bash

sam deploy --template-file templates/s3.yaml --stack-name s3-stack --no-confirm-changeset
sam deploy --template-file templates/dynamodb.yaml --stack-name dynamodb-stack --no-confirm-changeset

sam deploy \
    --template-file templates/amplify.yaml \
    --stack-name amplify-stack \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
    GitHubToken=YOUR_GITHUB_TOKEN \
    GitHubRepo=https://github.com/zagani212/amplify_app.git --no-confirm-changeset

sam deploy --template-file templates/cognito.yaml --stack-name cognito-stack --capabilities CAPABILITY_IAM --no-confirm-changeset --resolve-s3
sam deploy --template-file templates/functions.yaml --stack-name lambda-stack --capabilities CAPABILITY_IAM --no-confirm-changeset --resolve-s3
sam deploy --template-file templates/stepFunctions.yaml --stack-name stepFunctions-stack --capabilities CAPABILITY_IAM --no-confirm-changeset --resolve-s3
sam deploy --template-file templates/api-gateway.yaml --stack-name api-stack --no-confirm-changeset
sam deploy --template-file templates/amplify-branch.yaml --stack-name amplify-branch-stack --no-confirm-changeset