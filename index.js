const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('token');
const octokit = new github.getOctokit(token)
const context = github.context

const environment = core.getInput('environment');
console.log(`Getting ${environment}!`);

let page = 1

async function getDeployments() {
  return await octokit.rest.repos.listDeployments({
    ...context.repo,
    environment: environment,
    page: page
  }).then( response => {
    return response.data
  })
}

async function deploymentStatuses(deployment) {
  return await octokit.rest.repos.listDeploymentStatuses({
    ...context.repo,
    deployment_id: deployment.id
  }).then( response => {
    let statuses = response.data
    return statuses.map(status => status.state)
  })
}

(async () => {
  try {

    let deployments = await getDeployments()

    let status = await deployments.map(deployment => {
      return deploymentStatuses(deployment).then(deploymentStatus => {
        return {
          // 'id': deployment.id,
          'statusfrommap': deploymentStatus,
          'reffromMap': deployment.ref,
          ...deployment
        }
      })
    })

    
    // console.log(await getDeploymentsX())
    console.log(await Promise.all(status))
  
    // const time = (new Date()).toTimeString();
    // core.setOutput("time", time);
    // core.setOutput("ref", deployments);
    
    // Get the JSON webhook payload for the event that triggered the workflow
  
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})()