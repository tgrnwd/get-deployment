const core = require('@actions/core');
const github = require('@actions/github');

async function getDeployments() {
  const token = core.getInput('token');
  const octokit = new github.getOctokit(token)
  const context = github.context

  const environment = core.getInput('environment');
  console.log(`Getting ${environment}!`);

  let page = 1
  
  const deployments = await octokit.rest.repos.listDeployments({
    ...context.repo,
    environment: environment,
    page: page
  })

  return deployments.map(async deployment => {
    
    let status = await octokit.rest.repos.getDeployment({
      ...context.repo,
      deployment_id: deployment.id
    });

    return status.state == 'success' ? {
      'id': status.id,
      'status': status.state,
      'ref': deployment.ref
    } : {}
    
  }, []).filter(status => Object.keys(status).length > 0)

  // return deployments
}

try {

  let deployments = getDeployments()
  console.log(deployments)

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);

  core.setOutput("ref", deployments);
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

