const core = require('@actions/core');
const github = require('@actions/github');

try {
  const environment = core.getInput('environment');
  console.log(`Getting ${environment}!`);


  const time = (new Date()).toTimeString();
  core.setOutput("time", environment);

  core.setOutput("ref", time);
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}