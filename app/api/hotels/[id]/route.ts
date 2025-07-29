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
    const { name, city, rating, phone, address, amenities, description } = body
    const hotelId = params.id

    const client = await pool.connect()
    const result = await client.query(
      `
      UPDATE hotels 
      SET name = $1, city = $2, rating = $3, phone = $4, address = $5, amenities = $6, description = $7
      WHERE id = $8
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
      [name, city, rating, phone, address, amenities, description, hotelId],
    )

    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update hotel" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hotelId = params.id
    const client = await pool.connect()

    // Check if hotel is referenced in bookings
    const bookingCheck = await client.query(
      "SELECT COUNT(*) as count FROM bookings WHERE hotel = (SELECT name FROM hotels WHERE id = $1)",
      [hotelId],
    )

    if (Number.parseInt(bookingCheck.rows[0].count) > 0) {
      client.release()
      return NextResponse.json(
        { message: "Cannot delete hotel. It is referenced in existing bookings." },
        { status: 400 },
      )
    }

    // Delete the hotel
    const result = await client.query("DELETE FROM hotels WHERE id = $1 RETURNING *", [hotelId])

    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Hotel deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete hotel" }, { status: 500 })
  }
}
