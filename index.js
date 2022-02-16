const core = require('@actions/core');
const github = require('@actions/github');

async function getDeployments() {
  const token = core.getInput('token');
  const octokit = new github.getOctokit(token)
  const context = github.context

  const environment = core.getInput('environment');
  console.log(`Getting ${environment}!`);

  let page = 1
  
  // const deployments = await octokit.rest.repos.listDeployments({
  //   ...context.repo,
  //   environment: environment,
  //   page: page
  // }).then((data) => {
  //   let deployments = data.data

  //   // console.log(deployments)
    
  //   deployments.map(async deployment => {
  //     let deploymentStatus = await octokit.rest.repos.getDeployment({
  //       ...context.repo,
  //       deployment_id: deployment.id
  //     }).then( (deploymentStatus) => {

  //       console.log(deploymentStatus)

  //       octokit.rest.repos.getDeploymentStatus({
  //         owner,
  //         repo,
  //         deployment_id,
  //         status_id,
  //       });
        
  //       return deploymentStatus.state == 'success' ? {
  //         'id': deploymentStatus.id,
  //         'status': deploymentStatus.state,
  //         'ref': deployment.ref
  //       } : {}
  //     })

  //   }, [])
    
  // })

  // deployments.then(data => console.log(data))

  const deployments = await octokit.rest.repos.listDeployments({
    ...context.repo,
    environment: environment,
    page: page
  }).then( response => {
    return response.data
  })

  // const deploymentDetails = (deployment) => await octokit.rest.repos.listDeploymentStatuses({
  //   ...context.repo,
  //   deployment_id: deployment.id
  // }).then(data => {

  //   let statuses = data.data
  //   return statuses.map( status => {
  //     return status.state
  //   })
  // })

  function deploymentDetails(deployment) {
    return octokit.rest.repos.listDeploymentStatuses({
      ...context.repo,
      deployment_id: deployment.id
    }).then(data => {
  
      let statuses = data.data
      return statuses.map( status => {
        return status.state
      })
    })
  }

  async function mapDeploymentDetails(deployments) {
    
    return deployments.map(deployment => {
      return octokit.rest.repos.listDeploymentStatuses({
        ...context.repo,
        deployment_id: deployment.id
      }).then(data => {
    
        let statuses = data.data
        return statuses.map( status => {
          return status.state
        })
      })
    })
  }

  // const deploymentDetails = ( deployment ) => await octokit.rest.repos.listDeploymentStatuses({
  //   ...context.repo,
  //   deployment_id: deployment.id
  // })

  // const deploymentstatus = ( deployment ) => await octokit.rest.repos.getDeploymentStatus({
  //   ...context.repo,
  //   deployment_id,
  //   status_id,
  // });

  console.log( await deployments )

  let d = await deployments

  let x = await mapDeploymentDetails(d)

  // let x = d.map( deployment => {

  //   // return new Promise((resolve) => {

  //   //   return {
  //   //     "id": deployment.id,
  //   //     "sha": deployment.sha,
  //   //     "ref": deployment.ref,
  //   //     "states": resolve(deploymentDetails(deployment))
  //   //   }
  //   // })

  //   // return {
  //   //   "id": deployment.id,
  //   //   "sha": deployment.sha,
  //   //   "ref": deployment.ref,
  //   //   "states": await new Promise((resolve) => {
  //   //     resolve(deploymentDetails(deployment))
  //   //   })
  //   // }

  // })

  console.log( await x )

  // deployments.then( deploymentDetails( data ).then( deploymentstatus( data ) ) )

  // deployments.then( data.data.map())





  // return deployments.map(async deployment => {
    
  //   let status = await octokit.rest.repos.getDeployment({
  //     ...context.repo,
  //     deployment_id: deployment.id
  //   });

  //   return status.state == 'success' ? {
  //     'id': status.id,
  //     'status': status.state,
  //     'ref': deployment.ref
  //   } : {}
    
  // }, []).filter(status => Object.keys(status).length > 0)

  // return deployments
}

try {

  let deployments = getDeployments()
  // console.log(deployments)

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);

  core.setOutput("ref", deployments);
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

