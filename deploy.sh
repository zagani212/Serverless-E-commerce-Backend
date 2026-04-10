#!/bin/bash

sam deploy --template-file templates/s3.yaml --stack-name s3-stack --no-confirm-changeset
sam deploy --template-file templates/dynamodb.yaml --stack-name dynamodb-stack --no-confirm-changeset

sam deploy \
    --template-file templates/amplify.yaml \
    --stack-name amplify-stack \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
    GitHubToken=YOUR_GITHUB_TOKEN \
    GitHubRepo=YOUR_ITHUB_REPO \
    --no-confirm-changeset

sam deploy --template-file templates/cognito.yaml --stack-name cognito-stack --no-confirm-changeset
sam deploy --template-file templates/functions.yaml --stack-name lambda-stack --no-confirm-changeset
sam deploy --template-file templates/stepFunctions.yaml --stack-name stepFunctions-stack --capabilities CAPABILITY_NAMED_IAM --no-confirm-changeset
sam deploy --template-file templates/api-gateway.yaml --stack-name api-stack --no-confirm-changeset
sam deploy --template-file templates/amplify-branch.yaml --stack-name amplify-branch-stack --no-confirm-changeset
