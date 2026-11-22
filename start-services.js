const { spawn, execSync } = require('child_process');

const isWin = process.platform === 'win32';

const services = [
  {
    name: 'SERVER',
    cmd: isWin ? 'npm.cmd' : 'npm',
    args: ['run', 'dev', '--prefix', 'server'],
    color: '\x1b[36m', // Cyan
  },
  {
    name: 'CLIENT',
    cmd: isWin ? 'npm.cmd' : 'npm',
    args: ['run', 'dev', '--prefix', 'client'],
    color: '\x1b[32m', // Green
  },
  {
    name: 'AI-SVC',
    cmd: isWin ? 'python' : 'python3',
    args: ['-u', 'ai-service/app/main.py'],
    color: '\x1b[35m', // Magenta
  },
];

const resetColor = '\x1b[0m';
const children = [];

function killProcess(child) {
  if (!child || !child.pid) return;
  try {
    if (isWin) {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // Process might already be dead
  }
}

function cleanUpAndExit(code = 0) {
  console.log('\nShutting down all SmartBin AI services...');
  for (const child of children) {
    killProcess(child);
  }
  process.exit(code);
}

process.on('SIGINT', () => cleanUpAndExit(0));
process.on('SIGTERM', () => cleanUpAndExit(0));
process.on('exit', () => {
  for (const child of children) {
    killProcess(child);
  }
});

console.log('====================================================');
console.log(' Starting SmartBin AI Integrated Development Stack');
console.log(' - Server:     http://localhost:5000');
console.log(' - Client:     http://localhost:3000');
console.log(' - AI Service: http://localhost:8000');
console.log('====================================================\n');

for (const svc of services) {
  const child = spawn(svc.cmd, svc.args, {
    shell: isWin,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1', PYTHONUNBUFFERED: '1' },
  });

  children.push(child);

  const prefix = `${svc.color}[${svc.name}]${resetColor} `;

  child.stdout?.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`${prefix}${line}`);
      }
    }
  });

  child.stderr?.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.error(`${prefix}${line}`);
      }
    }
  });

  child.on('error', (err) => {
    console.error(`${prefix}Failed to start:`, err.message);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`${prefix}Exited with code ${code}`);
    }
  });
}
