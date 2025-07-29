import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { writeFileSync } from "fs"
import { join } from "path"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "costa_voyage",
  password: "mohamedrt133",
  port: 5432,
})

export async function POST(request: NextRequest) {
  try {
    const client = await pool.connect()

    // Get all data
    const bookingsResult = await client.query("SELECT * FROM bookings ORDER BY created_at DESC")
    const hotelsResult = await client.query("SELECT * FROM hotels ORDER BY created_at DESC")
    const citiesResult = await client.query("SELECT * FROM cities ORDER BY created_at DESC")

    client.release()

    // Create backup data
    const backupData = {
      timestamp: new Date().toISOString(),
      bookings: bookingsResult.rows,
      hotels: hotelsResult.rows,
      cities: citiesResult.rows,
    }

    // Generate SQL backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    let sqlBackup = `-- Costa Voyage Database Backup\n-- Generated on: ${new Date().toLocaleString()}\n\n`

    // Bookings backup
    sqlBackup += "-- Bookings Data\n"
    sqlBackup += "TRUNCATE TABLE bookings RESTART IDENTITY CASCADE;\n"
    bookingsResult.rows.forEach((booking) => {
      sqlBackup += `INSERT INTO bookings (id, agency, hotel, city, check_in, check_out, rooms, guests, status, notes, created_at) VALUES ('${booking.id}', '${booking.agency}', '${booking.hotel}', '${booking.city}', '${booking.check_in}', '${booking.check_out}', ${booking.rooms}, ${booking.guests}, '${booking.status}', '${booking.notes || ""}', '${booking.created_at}');\n`
    })

    // Hotels backup
    sqlBackup += "\n-- Hotels Data\n"
    sqlBackup += "TRUNCATE TABLE hotels RESTART IDENTITY CASCADE;\n"
    hotelsResult.rows.forEach((hotel) => {
      const amenitiesStr = Array.isArray(hotel.amenities) ? hotel.amenities.join(",") : hotel.amenities
      sqlBackup += `INSERT INTO hotels (id, name, city, rating, phone, address, amenities, description, image, created_at) VALUES (${hotel.id}, '${hotel.name}', '${hotel.city}', ${hotel.rating}, '${hotel.phone}', '${hotel.address}', '{${amenitiesStr}}', '${hotel.description}', '${hotel.image}', '${hotel.created_at}');\n`
    })

    // Cities backup
    sqlBackup += "\n-- Cities Data\n"
    sqlBackup += "TRUNCATE TABLE cities RESTART IDENTITY CASCADE;\n"
    citiesResult.rows.forEach((city) => {
      sqlBackup += `INSERT INTO cities (id, name, country, description, image, is_active, created_at) VALUES (${city.id}, '${city.name}', '${city.country}', '${city.description}', '${city.image}', ${city.is_active}, '${city.created_at}');\n`
    })

    // Save backup file
    const backupPath = join(process.cwd(), "backups", `costa_voyage_backup_${timestamp}.sql`)
    writeFileSync(backupPath, sqlBackup)

    return NextResponse.json({
      message: "Backup created successfully",
      filename: `costa_voyage_backup_${timestamp}.sql`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Backup error:", error)
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
