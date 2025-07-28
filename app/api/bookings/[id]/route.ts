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
    const bookingId = params.id

    const client = await pool.connect()

    // If only status is being updated (for cancel operation)
    if (Object.keys(body).length === 1 && body.status) {
      const result = await client.query(
        `
        UPDATE bookings 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
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
          notes,
          created_at as "createdAt"
      `,
        [body.status, bookingId],
      )

      client.release()

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      return NextResponse.json(result.rows[0])
    }

    // Full update
    const { agency, hotel, city, checkIn, checkOut, rooms, guests, status, notes } = body

    const result = await client.query(
      `
      UPDATE bookings 
      SET agency = $1, hotel = $2, city = $3, check_in = $4, check_out = $5, 
          rooms = $6, guests = $7, status = $8, notes = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
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
        notes,
        created_at as "createdAt"
    `,
      [agency, hotel, city, checkIn, checkOut, rooms, guests, status, notes, bookingId],
    )

    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id

    const client = await pool.connect()
    const result = await client.query("DELETE FROM bookings WHERE id = $1 RETURNING id", [bookingId])

    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
