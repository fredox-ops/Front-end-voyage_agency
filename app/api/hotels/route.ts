import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "costa_voyage",
  password: "mohamedrt133",
  port: 5432,
})

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT 
        id,
        name,
        city,
        rating,
        phone,
        address,
        amenities,
        description,
        image,
        created_at as "createdAt"
      FROM hotels 
      ORDER BY created_at DESC
    `)
    client.release()

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, city, rating, phone, address, amenities, description } = body

    const client = await pool.connect()
    const result = await client.query(
      `
      INSERT INTO hotels (name, city, rating, phone, address, amenities, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        name,
        city,
        rating,
        phone,
        address,
        amenities,
        description,
        image,
        created_at as "createdAt"
    `,
      [name, city, rating, phone, address, amenities, description],
    )

    client.release()

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create hotel" }, { status: 500 })
  }
}
