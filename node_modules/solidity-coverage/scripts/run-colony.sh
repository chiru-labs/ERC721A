#!/usr/bin/env bash
#
# E2E CI: installs PR candidate on colonyNetwork and runs coverage
#

set -o errexit

# Get path to PR branch
PR_PATH=$(echo "$CIRCLE_REPOSITORY_URL#$CIRCLE_BRANCH" | sed 's/git@github.com:/https:\/\/github.com\//')
echo "Installing $PR_PATH"

# Setup
sudo npm install -g yarn
git clone https://github.com/JoinColony/colonyNetwork.git
cd colonyNetwork || exit

# Swap installed coverage for PR branch version
sudo yarn
sudo yarn remove -W solidity-coverage --dev
sudo yarn add -W "$PR_PATH" --dev

git submodule update --init
sed -i 's/docker: true,/ /g' truffle.js
sudo yarn run provision:token:contracts
sudo yarn run test:contracts:coverage
