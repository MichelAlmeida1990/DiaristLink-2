const fs = require('fs')
const path = require('path')

// Restaurar pasta app/_api para app/api após build mobile
const apiPath = path.join(process.cwd(), 'app', 'api')
const apiBackupPath = path.join(process.cwd(), 'app', '_api')

if (fs.existsSync(apiBackupPath)) {
  if (fs.existsSync(apiPath)) {
    fs.rmSync(apiPath, { recursive: true, force: true })
  }
  fs.renameSync(apiBackupPath, apiPath)
  console.log('✅ Pasta app/_api restaurada para app/api')
}




