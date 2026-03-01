# Vercel Setup

## Current preview

- Preview: `https://skill-deploy-qva0yj9zi0-codex-agent-deploys.vercel.app`
- Claim: `https://vercel.com/claim-deployment?code=2b5115a4-e8ed-424d-b0de-2a48211c7b81`

## What you need to do

### 1. Claim the deployment

Open the claim URL in your browser while signed in to Vercel.

That will attach the preview deployment to your Vercel account so you can manage env vars and future redeploys.

### 2. Add the OpenAI env vars

In Vercel:

1. Open the claimed project.
2. Go to `Settings`.
3. Go to `Environment Variables`.
4. Add:

`OPENAI_API_KEY`

Set its value to your OpenAI API key.

Optional:

`OPENAI_MODEL`

Recommended value:

`gpt-4.1-mini`

If you want a stronger but more expensive model later, switch this value rather than changing code.

### 3. Redeploy

After adding env vars:

1. Open `Deployments`.
2. Open the latest deployment.
3. Click `Redeploy`.

That causes `/api/analyze` to use the server-side env vars.

## After redeploy

When the preview is live:

1. Open it in Safari on iPhone.
2. Tap `Share`.
3. Tap `Add to Home Screen`.

## Recommended model setting

Start with:

`OPENAI_MODEL=gpt-4.1-mini`

Reason:

- fast enough for iterative dream analysis
- cheaper than larger models
- good fit for structured JSON output

If you later want richer symbolic synthesis, test a stronger model behind the same route.
