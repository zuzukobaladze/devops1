const { execSync } = require('child_process');

// Rollback script for Heroku deployments
// This script can be run manually or integrated into a CI/CD pipeline

function executeCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    process.exit(1);
  }
}

// Perform the rollback
function rollback(appName) {
  console.log(`Starting rollback process for ${appName}...`);

  // Get the latest releases
  const releases = executeCommand(`heroku releases -a ${appName}`);
  console.log(`Current releases for ${appName}:`);
  console.log(releases);

  // Execute the rollback to the previous version
  console.log(`Rolling back ${appName} to previous version...`);
  executeCommand(`heroku rollback -a ${appName}`);

  console.log(`Rollback completed for ${appName}.`);
}

// Main execution flow
function main() {
  // Get the app name from command line arguments or environment variables
  const appName = process.argv[2] || process.env.HEROKU_APP_NAME;

  if (!appName) {
    console.error('Error: No app name provided.');
    console.error('Usage: node rollback.js <app_name>');
    process.exit(1);
  }

  rollback(appName);
}

main(); 