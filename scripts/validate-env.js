/**
 * Supabase S3环境变量配置验证和测试脚本 (JavaScript版本)
 * 验证所有必需的环境变量并测试连接和基本功能
 */

// 导入必要的模块
import { 
  listCloudFiles, 
  uploadFileSecurely, 
  deleteFileSecurely, 
  unlockSession,
  getFileMetadata
} from '../services/storageService.js';

// 环境变量验证配置
const REQUIRED_ENV_VARS = [
  'VITE_AWS_S3_ENDPOINT',
  'VITE_AWS_S3_REGION',
  'VITE_AWS_S3_ACCESS_KEY_ID',
  'VITE_AWS_S3_SECRET_ACCESS_KEY',
  'VITE_AWS_S3_BUCKET',
  'VITE_SUPABASE_AUTH_URL',
  'VITE_PASSWORD_HASH',
  'VITE_TEMP_TOKEN_SECRET',
  'VITE_TEMP_TOKEN_TTL'
];

class EnvironmentValidator {
  constructor() {
    this.results = [];
  }

  // 验证环境变量是否存在
  validateEnvironmentVariables() {
    console.log('🔍 验证环境变量配置...');
    
    const missingVars = [];
    const envVars = {};

    for (const varName of REQUIRED_ENV_VARS) {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
      } else {
        envVars[varName] = value;
        // 隐藏敏感信息
        if (varName.includes('KEY') || varName.includes('SECRET') || varName.includes('PASSWORD')) {
          console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
        } else {
          console.log(`✅ ${varName}: ${value}`);
        }
      }
    }

    if (missingVars.length > 0) {
      return {
        success: false,
        message: `缺少以下环境变量: ${missingVars.join(', ')}`
      };
    }

    return {
      success: true,
      message: '所有必需的环境变量都已配置',
      details: envVars
    };
  }

  // 验证S3存储桶配置
  async validateS3Configuration() {
    console.log('\n🔍 验证S3存储桶配置...');
    
    try {
      const files = await listCloudFiles();
      console.log(`✅ 成功连接到存储桶，当前文件数量: ${files.length}`);
      
      return {
        success: true,
        message: 'S3存储桶配置正确',
        details: { fileCount: files.length, files: files.slice(0, 5) }
      };
    } catch (error) {
      console.error('❌ S3存储桶连接失败:', error);
      return {
        success: false,
        message: '无法连接到S3存储桶',
        details: error.message || String(error)
      };
    }
  }

  // 验证Supabase认证服务连接
  async validateAuthConnection() {
    console.log('\n🔍 验证Supabase认证服务连接...');
    
    try {
      // 测试解锁功能（使用错误密码来验证连接）
      const response = await unlockSession('invalid_password_for_testing');
      
      if (response === null) {
        console.log('✅ 认证服务连接正常（拒绝无效密码）');
        return {
          success: true,
          message: 'Supabase认证服务连接正常'
        };
      } else {
        console.log('⚠️  认证服务可能存在问题（应该拒绝无效密码）');
        return {
          success: false,
          message: '认证服务返回了意外的结果'
        };
      }
    } catch (error) {
      console.error('❌ 认证服务连接失败:', error);
      return {
        success: false,
        message: '无法连接到Supabase认证服务',
        details: error.message || String(error)
      };
    }
  }

  // 测试安全文件上传
  async testSecureUpload() {
    console.log('\n🔍 测试安全文件上传...');
    
    try {
      // 首先尝试获取认证令牌
      const token = await unlockSession('888888'); // 使用配置的密码
      
      if (!token) {
        return {
          success: false,
          message: '无法获取认证令牌，无法进行上传测试'
        };
      }
      
      console.log('✅ 成功获取认证令牌');
      
      // 创建测试文件
      const testContent = '这是一个测试文件内容';
      const testFile = new File([testContent], 'test-upload.txt', { 
        type: 'text/plain' 
      });
      
      // 测试上传
      const uploadSuccess = await uploadFileSecurely(testFile, 'test/', token);
      
      if (uploadSuccess) {
        console.log('✅ 安全文件上传测试成功');
        return {
          success: true,
          message: '安全文件上传功能正常'
        };
      } else {
        console.log('❌ 安全文件上传测试失败');
        return {
          success: false,
          message: '安全文件上传失败'
        };
      }
    } catch (error) {
      console.error('❌ 上传测试过程中出现错误:', error);
      return {
        success: false,
        message: '上传测试失败',
        details: error.message || String(error)
      };
    }
  }

  // 测试安全文件删除
  async testSecureDelete() {
    console.log('\n🔍 测试安全文件删除...');
    
    try {
      // 获取认证令牌
      const token = await unlockSession('888888');
      
      if (!token) {
        return {
          success: false,
          message: '无法获取认证令牌，无法进行删除测试'
        };
      }
      
      console.log('✅ 成功获取认证令牌');
      
      // 获取文件列表
      const files = await listCloudFiles();
      const testFiles = files.filter(f => f.key.startsWith('test/'));
      
      if (testFiles.length === 0) {
        console.log('ℹ️  没有测试文件，跳过删除测试');
        return {
          success: true,
          message: '没有测试文件需要删除'
        };
      }
      
      // 删除测试文件
      const testFile = testFiles[0];
      const deleteSuccess = await deleteFileSecurely(testFile.key, token);
      
      if (deleteSuccess) {
        console.log('✅ 安全文件删除测试成功');
        return {
          success: true,
          message: '安全文件删除功能正常'
        };
      } else {
        console.log('❌ 安全文件删除测试失败');
        return {
          success: false,
          message: '安全文件删除失败'
        };
      }
    } catch (error) {
      console.error('❌ 删除测试过程中出现错误:', error);
      return {
        success: false,
        message: '删除测试失败',
        details: error.message || String(error)
      };
    }
  }

  // 综合测试结果
  generateReport() {
    console.log('\n📋 验证报告:');
    console.log('='.repeat(50));
    
    let successCount = 0;
    let totalCount = this.results.length;
    
    for (const [index, result] of this.results.entries()) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} 测试 ${index + 1}: ${result.message}`);
      
      if (!result.success && result.details) {
        console.log(`   详细信息: ${JSON.stringify(result.details, null, 2)}`);
      }
      
      if (result.success) successCount++;
    }
    
    console.log('='.repeat(50));
    console.log(`总计: ${successCount}/${totalCount} 个测试通过`);
    
    if (successCount === totalCount) {
      console.log('🎉 所有测试都通过了！环境配置正确。');
    } else {
      console.log('⚠️  部分测试失败，请检查配置。');
    }
  }

  // 运行所有验证
  async runValidation() {
    console.log('🚀 开始Supabase S3环境配置验证...\n');
    
    // 1. 环境变量验证
    const envResult = this.validateEnvironmentVariables();
    this.results.push(envResult);
    
    if (!envResult.success) {
      console.log('❌ 环境变量验证失败，停止后续测试');
      this.generateReport();
      return;
    }
    
    // 2. S3配置验证
    const s3Result = await this.validateS3Configuration();
    this.results.push(s3Result);
    
    // 3. 认证服务验证
    const authResult = await this.validateAuthConnection();
    this.results.push(authResult);
    
    // 4. 安全上传测试
    const uploadResult = await this.testSecureUpload();
    this.results.push(uploadResult);
    
    // 5. 安全删除测试
    const deleteResult = await this.testSecureDelete();
    this.results.push(deleteResult);
    
    // 生成最终报告
    this.generateReport();
  }
}

// 主函数
async function main() {
  const validator = new EnvironmentValidator();
  await validator.runValidation();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('验证过程中出现错误:', error);
    process.exit(1);
  });
}

export { EnvironmentValidator };