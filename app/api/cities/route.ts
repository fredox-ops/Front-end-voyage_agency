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
        country,
        description,
        image,
        is_active as "isActive",
        created_at as "createdAt"
      FROM cities 
      ORDER BY name ASC
    `)
    client.release()

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, country, description, isActive } = body

    const client = await pool.connect()
    const result = await client.query(
      `
      INSERT INTO cities (name, country, description, image, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        name,
        country,
        description,
        image,
        is_active as "isActive",
        created_at as "createdAt"
    `,
      [name, country, description, "/placeholder.svg?height=200&width=300", isActive],
    )

    client.release()

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create city" }, { status: 500 })
  }
}
