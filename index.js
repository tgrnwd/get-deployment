const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('token');
const octokit = new github.getOctokit(token)
const context = github.context

const environment = core.getInput('environment');
console.log(`Getting ${environment}!`);

let page = 1

async function getDeployments(page = 1) {
  return await octokit.rest.repos.listDeployments({
    ...context.repo,
    environment: environment,
    page: page
  }).then( response => {
    return response.data
  })
}

async function deploymentStatuses(deployment, page = 1) {
  return await octokit.rest.repos.listDeploymentStatuses({
    ...context.repo,
    deployment_id: deployment.id,
    page: page
  }).then( response => {
    let statuses = response.data
    return statuses.map(status => status.state)
  })
}

function testStatus(statuses) {
  return ( statuses.status.includes('success') && !statuses.status.includes('inactive') )
}

async function findRequestedDeployment(deploymentsPage = 1) {
  let deployments = await getDeployments(deploymentsPage)
  let getNextDeploymentsPage = true

  for (const deployment of await deployments) {

    // console.log(deployment)
    let statuses = deploymentStatuses(deployment).then(deploymentStatus => {
      
      return {
        'deploymentID': deployment.id,
        'status': deploymentStatus,
        'ref': deployment.ref,
        'sha': deployment.sha
      }
    })

    // console.log(await statuses)

    if ( testStatus( await statuses ) ) {
      // successful condition is found
      console.log("condition met")

      deployment["foundStatus"] = statuses
      
      getNextDeploymentsPage = false

      return deployment;
      
      break;
    }
  }

  if (getNextDeploymentsPage) {
    findRequestedDeployment(deploymentsPage++)
  }
}

(async () => {
  try {

    let foundDeployment = await findRequestedDeployment()
    console.log(await foundDeployment)

    // console.log(await getDeploymentsX())
    // console.log(await Promise.all(status))
  
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