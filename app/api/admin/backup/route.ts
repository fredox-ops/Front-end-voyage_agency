import { NextResponse } from "next/server"
import { Pool } from "pg"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"

const execAsync = promisify(exec)

const pool = new Pool({
  user: "postgres", // Change this to your PostgreSQL username
  host: "localhost",
  database: "costa_voyage", // Change this to your database name
  password: "mohamedrt133", // Change this to your PostgreSQL password
  port: 5432,
})

export async function POST() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupFile = `costa_voyage_backup_${timestamp}.sql`
    const backupDir = path.join(process.cwd(), "backups")

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backupPath = path.join(backupDir, backupFile)

    // Create database backup using pg_dump
    const command = `pg_dump -h localhost -U your_username -d costa_voyage > "${backupPath}"`

    await execAsync(command, {
      env: { ...process.env, PGPASSWORD: "your_password" },
    })

    // Log backup in database
    const client = await pool.connect()
    await client.query(
      `
      INSERT INTO backups (filename, created_at, status)
      VALUES ($1, NOW(), 'completed')
    `,
      [backupFile],
    )
    client.release()

    return NextResponse.json({
      success: true,
      message: "Backup completed successfully",
      filename: backupFile,
    })
  } catch (error) {
    console.error("Backup error:", error)
    return NextResponse.json({ error: "Backup failed" }, { status: 500 })
  }
}
