# CI/CD Pipeline with Automated Testing and Deployment Strategies

This repository demonstrates a complete CI/CD pipeline with automated testing and various deployment strategies using GitHub Actions and Heroku.

## Project Structure

```
project/
├── app/
│   └── src/
│       └── index.js          # Main application code
├── test/
│   └── app.test.js           # Test files
├── scripts/
│   ├── rollback.js           # Rollback script
│   └── canary-analysis.js    # Canary deployment analysis script
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI workflow
│       └── cd.yml            # CD workflow
├── Procfile                  # Heroku deployment configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Documentation
```

## Part 1: Continuous Integration (CI) with Automated Testing

The CI pipeline is configured to run on every push to the `main` branch and on pull requests. It performs the following steps:

1. Check out the code
2. Set up Node.js
3. Install dependencies
4. Run automated tests
5. Upload test results as artifacts

### Running Tests Locally

To run tests locally:

```bash
npm install
npm test
```

## Part 2: Continuous Deployment (CD) with Deployment Strategies

The CD pipeline is triggered on pushes to the `main` branch after tests pass successfully. It implements a multi-environment deployment strategy:

1. **Staging Environment**
   - Deploys to a staging environment for initial validation
   - Runs smoke tests to confirm deployment

2. **Canary Deployment**
   - Deploys to a canary environment (10% of traffic)
   - Analyzes canary health and performance

3. **Production Deployment**
   - Deploys to production if canary is successful
   - Has rollback capabilities if issues are detected

### Canary Deployment Strategy

The canary deployment helps to minimize risk by releasing changes to a small subset of users before rolling out to the entire user base. The `scripts/canary-analysis.js` script monitors the health of the canary deployment and makes a decision whether to promote it to production or roll back.

### Rollback Strategy

In case of deployment issues, the `scripts/rollback.js` script can be manually executed or automatically triggered to revert to the previous stable version.

To perform a manual rollback:

```bash
node scripts/rollback.js <app-name>
```

## Required Setup for Heroku Deployment

1. Create three Heroku apps:
   - `<app-name>-staging`
   - `<app-name>-canary`
   - `<app-name>` (production)

2. Set up the following GitHub repository secrets:
   - `HEROKU_API_KEY`: Your Heroku API key
   - `HEROKU_EMAIL`: Your Heroku account email
   - `HEROKU_APP_NAME`: Your application name (without the suffix)

## Running the Application Locally

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000

## API Endpoints

- `GET /`: Returns a welcome message
- `GET /health`: Returns the application's health status 