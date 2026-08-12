module.exports = {
  apps: [
    {
      name: "runner",
      // dist is produced inside the runner workspace (runner/dist)
      // Use the workspace-relative path so pm2 resolves to /usr/src/app/runner/dist/index.js
      script: "./dist/index.js",
      // Use cluster mode in production for horizontal scaling. For development/debugging
      // override to fork mode and enable the Node inspector so you can attach a debugger.
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production"
      },
      env_production: {
        // Production environment variables — set these to match your Redis/session infrastructure
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
        // In development prefer fork mode so the Node inspector can be attached
        // to the single process. This avoids the extra master/worker indirection
        // that makes debugging with pm2 cluster mode difficult.
        ,
        instances: "1",
        exec_mode: "fork",
        // Enable inspector on 0.0.0.0:9229 so IDEs can attach. Change or remove in CI.
        node_args: "--inspect=0.0.0.0:9229"
      }
    }
  ]
};
