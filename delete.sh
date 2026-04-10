#!/bin/bash

sam delete --stack-name amplify-branch-stack --no-prompts
sam delete --stack-name api-stack --no-prompts
sam delete --stack-name stepFunctions-stack --no-prompts
sam delete --stack-name lambda-stack --no-prompts
sam delete --stack-name cognito-stack --no-prompts
sam delete --stack-name amplify-stack --no-prompts
sam delete --stack-name dynamodb-stack --no-prompts

BUCKET=YOUR_BUCKET_NAME_HERE

# Delete all versions
aws s3api list-object-versions --bucket $BUCKET \
  --query='{Objects: Versions[].{Key:Key,VersionId:VersionId}}' \
  --output json > versions.json

aws s3api delete-objects --bucket $BUCKET --delete file://versions.json

# Delete delete markers
aws s3api list-object-versions --bucket $BUCKET \
  --query='{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' \
  --output json > markers.json

aws s3api delete-objects --bucket $BUCKET --delete file://markers.json

sam delete --stack-name s3-stack --no-prompts