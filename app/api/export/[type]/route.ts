import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import * as XLSX from "xlsx"

const pool = new Pool({
  user: "postgres", // Change this to your PostgreSQL username
  host: "localhost",
  database: "costa_voyage", // Change this to your database name
  password: "mohamedrt133", // Change this to your PostgreSQL password
  port: 5432,
})

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "excel"
    const type = params.type

    const client = await pool.connect()
    let result
    let filename

    if (type === "bookings") {
      result = await client.query(`
        SELECT 
          id as "Booking ID",
          agency as "Agency",
          hotel as "Hotel",
          city as "City",
          check_in as "Check In",
          check_out as "Check Out",
          rooms as "Rooms",
          guests as "Guests",
          status as "Status",
          created_at as "Created At"
        FROM bookings 
        ORDER BY created_at DESC
      `)
      filename = "bookings_export"
    } else if (type === "hotels") {
      result = await client.query(`
        SELECT 
          id as "Hotel ID",
          name as "Name",
          city as "City",
          rating as "Rating",
          phone as "Phone",
          address as "Address",
          amenities as "Amenities",
          description as "Description",
          created_at as "Created At"
        FROM hotels 
        ORDER BY created_at DESC
      `)
      filename = "hotels_export"
    } else {
      client.release()
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    client.release()

    if (format === "excel") {
      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(result.rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, type)

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      })
    } else {
      // CSV format
      const headers = Object.keys(result.rows[0] || {})
      const csvContent = [
        headers.join(","),
        ...result.rows.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
