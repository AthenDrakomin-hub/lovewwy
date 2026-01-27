#!/usr/bin/env node
/**
 * 运行环境变量验证脚本
 * 用于验证Supabase S3配置和功能测试
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { config } from 'dotenv';

// 加载环境变量
config({ path: resolve('./.env.local') });

// 运行TypeScript验证脚本
const tsNode = spawn('npx', ['ts-node', 'scripts/validate-env.ts'], {
  cwd: resolve('.'),
  stdio: 'inherit',
  env: {
    ...process.env,
    TS_NODE_PROJECT: resolve('./tsconfig.json')
  }
});

tsNode.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ 验证完成');
  } else {
    console.log(`\n❌ 验证失败，退出码: ${code}`);
    process.exit(code);
  }
});

tsNode.on('error', (error) => {
  console.error('启动验证脚本时出错:', error);
  process.exit(1);
});