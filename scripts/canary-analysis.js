const https = require('https');
const { execSync } = require('child_process');

// Canary deployment analysis script
// This script monitors the health of a canary deployment and decides whether to promote it or roll back

// Configuration
const MONITOR_DURATION_SECONDS = 60; // How long to monitor the canary
const CHECK_INTERVAL_SECONDS = 10; // How often to check metrics
const ERROR_THRESHOLD_PERCENT = 1; // Max allowable error rate

// Utility to make HTTP requests with a promise interface
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const { statusCode } = res;

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode,
          data
        });
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

// Check the health endpoint
async function checkHealth(appUrl) {
  try {
    console.log(`Checking health of ${appUrl}...`);
    const response = await makeRequest(`${appUrl}/health`);
    return response.statusCode === 200;
  } catch (error) {
    console.error(`Error checking health: ${error.message}`);
    return false;
  }
}

// Monitor the canary deployment
async function monitorCanary(canaryAppName, productionAppName) {
  const canaryUrl = `https://${canaryAppName}.herokuapp.com`;
  const productionUrl = `https://${productionAppName}.herokuapp.com`;

  console.log(`Starting canary analysis for ${canaryAppName}...`);
  console.log(`Monitoring for ${MONITOR_DURATION_SECONDS} seconds...`);

  let successfulChecks = 0;
  let failedChecks = 0;
  let elapsedTime = 0;

  while (elapsedTime < MONITOR_DURATION_SECONDS) {
    const canaryHealthy = await checkHealth(canaryUrl);
    const productionHealthy = await checkHealth(productionUrl);

    if (canaryHealthy) {
      successfulChecks++;
      console.log(`✅ Canary health check passed (${successfulChecks}/${successfulChecks + failedChecks})`);
    } else {
      failedChecks++;
      console.log(`❌ Canary health check failed (${failedChecks}/${successfulChecks + failedChecks})`);
    }

    if (productionHealthy) {
      console.log('✅ Production is healthy');
    } else {
      console.log('⚠️ Production health check failed!');
    }

    // Wait for the next check interval
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_SECONDS * 1000));
    elapsedTime += CHECK_INTERVAL_SECONDS;
  }

  // Calculate error rate
  const totalChecks = successfulChecks + failedChecks;
  const errorRate = (failedChecks / totalChecks) * 100;

  console.log(`\nCanary Analysis Results:`);
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Successful: ${successfulChecks}`);
  console.log(`Failed: ${failedChecks}`);
  console.log(`Error Rate: ${errorRate.toFixed(2)}%`);

  // Decide whether to promote or rollback
  if (errorRate <= ERROR_THRESHOLD_PERCENT) {
    console.log(`\n✅ Canary deployment is healthy (Error rate: ${errorRate.toFixed(2)}%)`);
    console.log('Recommending promotion to production');
    return true;
  } else {
    console.log(`\n❌ Canary deployment exceeds error threshold (Error rate: ${errorRate.toFixed(2)}%)`);
    console.log('Recommending rollback');
    return false;
  }
}

// Main execution flow
async function main() {
  // Get app names from command line arguments or environment variables
  const canaryAppName = process.argv[2] || `${process.env.HEROKU_APP_NAME}-canary`;
  const productionAppName = process.argv[3] || process.env.HEROKU_APP_NAME;

  if (!canaryAppName || !productionAppName) {
    console.error('Error: Insufficient app names provided.');
    console.error('Usage: node canary-analysis.js <canary_app_name> <production_app_name>');
    process.exit(1);
  }

  try {
    const shouldPromote = await monitorCanary(canaryAppName, productionAppName);

    if (shouldPromote) {
      process.exit(0); // Success - proceed with promotion
    } else {
      process.exit(1); // Failure - trigger rollback
    }
  } catch (error) {
    console.error(`Canary analysis failed: ${error.message}`);
    process.exit(1);
  }
}

main(); 