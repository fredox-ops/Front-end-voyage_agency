import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  user: "postgres", // Change this to your PostgreSQL username
  host: "localhost",
  database: "costa_voyage", // Change this to your database name
  password: "mohamedrt133", // Change this to your PostgreSQL password
  port: 5432,
})

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT 
        id,
        name,
        destination,
        duration,
        group_size as "groupSize",
        description,
        image,
        created_at as "createdAt"
      FROM tours 
      ORDER BY created_at DESC
    `)
    client.release()

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch tours" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, destination, duration, groupSize, description, image } = body

    const client = await pool.connect()
    const result = await client.query(
      `
      INSERT INTO tours (name, destination, duration, group_size, description, image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        name,
        destination,
        duration,
        group_size as "groupSize",
        description,
        image,
        created_at as "createdAt"
    `,
      [name, destination, duration, groupSize, description, image],
    )

    client.release()

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create tour" }, { status: 500 })
  }
}
