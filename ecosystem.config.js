module.exports = {
  apps: [
    {
      name: 'smt-golf',
      script: 'dist/server/index.js',
      cwd: '/home/cloudpanel/htdocs/smt.4tmrw.net',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
