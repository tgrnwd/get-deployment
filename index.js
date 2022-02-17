const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('token');
const octokit = new github.getOctokit(token)
const context = github.context

const environment = core.getInput('environment');

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

  if ( ! deployments.length ) return false;

  for (const deployment of await deployments) {

    let statuses = deploymentStatuses(deployment).then(deploymentStatus => {
      
      return {
        'deploymentID': deployment.id,
        'status': deploymentStatus,
        'ref': deployment.ref,
        'sha': deployment.sha
      }
    })

    if ( testStatus( await statuses ) ) {
      return await statuses;
    }
  }

  findRequestedDeployment(deploymentsPage++)
}

(async () => {
  try {
    console.log(`Getting deployments from environment: ${environment}`);

    let activeDeployment = await findRequestedDeployment()
    console.log( activeDeployment ? activeDeployment : "No Deployments Found" )

    core.setOutput("deploymentID", await activeDeployment.deploymentID);
    core.setOutput("ref", await activeDeployment.ref);
    core.setOutput("status", await activeDeployment.status);
    core.setOutput("sha", await activeDeployment.sha);

    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})()