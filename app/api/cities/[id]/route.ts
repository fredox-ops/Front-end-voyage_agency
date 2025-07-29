import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "costa_voyage",
  password: "mohamedrt133",
  port: 5432,
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, country, description, isActive } = body
    const cityId = params.id

    const client = await pool.connect()
    const result = await client.query(
      `
      UPDATE cities 
      SET name = $1, country = $2, description = $3, is_active = $4
      WHERE id = $5
      RETURNING 
        id,
        name,
        country,
        description,
        image,
        is_active as "isActive",
        created_at as "createdAt"
    `,
      [name, country, description, isActive, cityId],
    )

    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update city" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cityId = params.id
    const client = await pool.connect()

    // Check if city is referenced in bookings or hotels
    const bookingCheck = await client.query(
      "SELECT COUNT(*) as count FROM bookings WHERE city = (SELECT name FROM cities WHERE id = $1)",
      [cityId],
    )
    const hotelCheck = await client.query(
      "SELECT COUNT(*) as count FROM hotels WHERE city = (SELECT name FROM cities WHERE id = $1)",
      [cityId],
    )

    if (Number.parseInt(bookingCheck.rows[0].count) > 0 || Number.parseInt(hotelCheck.rows[0].count) > 0) {
      client.release()
      return NextResponse.json(
        { message: "Cannot delete city. It is referenced in existing bookings or hotels." },
        { status: 400 },
      )
    }

    // Delete the city
    const result = await client.query("DELETE FROM cities WHERE id = $1 RETURNING *", [cityId])

    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "City deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete city" }, { status: 500 })
  }
}
