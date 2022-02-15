# get-deployment

# Get Deployment - GitHub Action

This action gets details about the specified environment's deployment

## Inputs

## `environment`

**Required** The name of the environment. Default `""`.

## `params`

**Required** Parameters of Deployment in the specified environment. Default `"latest active"`. Also available, `"success fail inactive"`

## Outputs

## `time`

The time the action ran.

## `ref`

Ref of deployment.


## Example usage

uses: tgrnwd/get-deployment@v0.1
with:
  environment: 'dev'