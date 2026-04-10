#!/bin/bash

sam deploy --template-file s3.yaml --stack-name s3-stack --no-confirm-changeset
sam deploy --template-file dynamodb.yaml --stack-name dynamodb-stack --no-confirm-changeset

sam deploy \
    --template-file amplify.yaml \
    --stack-name amplify-stack \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
    GitHubToken=YOUR_GITHUB_TOKEN \
    GitHubRepo=YOUR_ITHUB_REPO \
    --no-confirm-changeset

sam deploy --template-file cognito.yaml --stack-name cognito-stack --no-confirm-changeset
sam deploy --template-file functions.yaml --stack-name lambda-stack --no-confirm-changeset
sam deploy --template-file stepFunctions.yaml --stack-name stepFunctions-stack --capabilities CAPABILITY_NAMED_IAM --no-confirm-changeset
sam deploy --template-file api-gateway.yaml --stack-name api-stack --no-confirm-changeset
sam deploy --template-file amplify-branch.yaml --stack-name amplify-branch-stack --no-confirm-changeset
