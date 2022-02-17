# Get Deployment - GitHub Action

This action gets details about the specified environment's current active deployment via the GitHub API.

## Inputs

### `environment`

**Required** The name of the environment. Default `""`.

## Outputs

### `deploymentID`

ID of deployment

### `sha`

SHA of deployed code

### `status`

Status(es) of deployment

### `ref`

git ref of deployment

### Example usage

```yml
uses: tgrnwd/get-deployment@v0.1
with:
  token: ${{ secrets.GITHUB_TOKEN  }}
  environment: dev
```