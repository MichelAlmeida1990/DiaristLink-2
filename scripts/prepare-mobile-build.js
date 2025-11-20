const fs = require('fs')
const path = require('path')

// Renomear pasta app/api para app/_api durante build mobile
const apiPath = path.join(process.cwd(), 'app', 'api')
const apiBackupPath = path.join(process.cwd(), 'app', '_api')

if (fs.existsSync(apiPath)) {
  if (fs.existsSync(apiBackupPath)) {
    fs.rmSync(apiBackupPath, { recursive: true, force: true })
  }
  fs.renameSync(apiPath, apiBackupPath)
  console.log('✅ Pasta app/api renomeada para app/_api')
}




