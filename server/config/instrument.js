// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"
// import { nodeProfileIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://005b299a13f628cec9cb7a5b93e8142b@o4510170976616448.ingest.de.sentry.io/4510170993131600",
  integrations : [
    Sentry.mongooseIntegration()
  ],
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});