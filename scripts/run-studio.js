#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');

const studio = spawn('npx', ['prisma', 'studio', '--url', process.env.DATABASE_URL], {
  stdio: 'inherit',
  shell: true
});

studio.on('close', (code) => {
  process.exit(code);
});
