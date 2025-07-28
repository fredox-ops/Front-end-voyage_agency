import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import * as XLSX from "xlsx"
import PDFDocument from "pdfkit"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "costa_voyage",
  password: "mohamedrt133",
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
          notes as "Notes",
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
    } else if (type === "cities") {
      result = await client.query(`
        SELECT 
          id as "City ID",
          name as "Name",
          country as "Country",
          description as "Description",
          is_active as "Active",
          created_at as "Created At"
        FROM cities 
        ORDER BY created_at DESC
      `)
      filename = "cities_export"
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
    } else if (format === "pdf") {
      // Create PDF file
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on("data", (chunk) => chunks.push(chunk))

      return new Promise((resolve) => {
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks)
          resolve(
            new NextResponse(pdfBuffer, {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}.pdf"`,
              },
            }),
          )
        })

        // PDF Header
        doc.fontSize(20).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: "center" })
        doc.moveDown()
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" })
        doc.moveDown(2)

        if (result.rows.length === 0) {
          doc.text("No data available", { align: "center" })
        } else {
          // Table headers
          const headers = Object.keys(result.rows[0])
          let yPosition = doc.y

          // Draw headers
          doc.fontSize(10).fillColor("black")
          headers.forEach((header, index) => {
            doc.text(header, 50 + index * 80, yPosition, { width: 75 })
          })

          yPosition += 20
          doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
          yPosition += 10

          // Draw data rows
          result.rows.forEach((row, rowIndex) => {
            if (yPosition > 700) {
              // New page if needed
              doc.addPage()
              yPosition = 50
            }

            headers.forEach((header, colIndex) => {
              const value = row[header] ? String(row[header]) : ""
              doc.text(value.substring(0, 15), 50 + colIndex * 80, yPosition, { width: 75 })
            })
            yPosition += 15
          })
        }

        doc.end()
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
