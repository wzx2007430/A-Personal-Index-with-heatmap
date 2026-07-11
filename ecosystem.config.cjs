module.exports = {
  apps: [{
    name: "multiterm-astro",
    script: "dist/server/entry.mjs",
    cwd: "/root/multiterm-astro",
    env: {
      NODE_ENV: "production",
      HOST: "127.0.0.1",
      PORT: "4321",
      MOOD_SECRET: "d9ce7e3de8219013ec07bf843221f1ca062a66767632ce9c68d4acaca9dd3d6d",
    },
    max_memory_restart: "500M",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "/var/log/pm2/multiterm-error.log",
    out_file: "/var/log/pm2/multiterm-out.log",
  }],
};