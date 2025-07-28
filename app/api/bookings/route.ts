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
        agency,
        hotel,
        city,
        check_in as "checkIn",
        check_out as "checkOut",
        rooms,
        guests,
        status,
        created_at as "createdAt"
      FROM bookings 
      ORDER BY created_at DESC
    `)
    client.release()

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agency, hotel, city, checkIn, checkOut, rooms, guests, status } = body

    const client = await pool.connect()
    const result = await client.query(
      `
      INSERT INTO bookings (agency, hotel, city, check_in, check_out, rooms, guests, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id,
        agency,
        hotel,
        city,
        check_in as "checkIn",
        check_out as "checkOut",
        rooms,
        guests,
        status,
        created_at as "createdAt"
    `,
      [agency, hotel, city, checkIn, checkOut, rooms, guests, status],
    )

    client.release()

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
