import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"

const execAsync = promisify(exec)

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "costa_voyage",
  password: "mohamedrt133",
  port: 5432,
})

export async function POST(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupDir = path.join(process.cwd(), "backups")
    const backupFile = path.join(backupDir, `costa_voyage_backup_${timestamp}.sql`)

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Create database backup using pg_dump
    const command = `pg_dump -h localhost -U postgres -d costa_voyage -f "${backupFile}"`

    // Set PGPASSWORD environment variable for authentication
    const env = { ...process.env, PGPASSWORD: "mohamedrt133" }

    await execAsync(command, { env })

    // Verify backup file was created
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile)
      return NextResponse.json({
        message: "Backup completed successfully",
        filename: path.basename(backupFile),
        size: stats.size,
        timestamp: timestamp,
      })
    } else {
      throw new Error("Backup file was not created")
    }
  } catch (error) {
    console.error("Backup error:", error)
    return NextResponse.json({ error: "Backup failed" }, { status: 500 })
  }
}
