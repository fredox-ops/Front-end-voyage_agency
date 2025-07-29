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
    let headers

    switch (type) {
      case "bookings":
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
        headers = [
          "Booking ID",
          "Agency",
          "Hotel",
          "City",
          "Check In",
          "Check Out",
          "Rooms",
          "Guests",
          "Status",
          "Notes",
          "Created At",
        ]
        break

      case "hotels":
        result = await client.query(`
          SELECT 
            id as "Hotel ID",
            name as "Hotel Name",
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
        headers = [
          "Hotel ID",
          "Hotel Name",
          "City",
          "Rating",
          "Phone",
          "Address",
          "Amenities",
          "Description",
          "Created At",
        ]
        break

      case "cities":
        result = await client.query(`
          SELECT 
            id as "City ID",
            name as "City Name",
            country as "Country",
            description as "Description",
            is_active as "Active",
            created_at as "Created At"
          FROM cities 
          ORDER BY created_at DESC
        `)
        filename = "cities_export"
        headers = ["City ID", "City Name", "Country", "Description", "Active", "Created At"]
        break

      default:
        client.release()
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    client.release()

    if (format === "pdf") {
      // Generate PDF
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => {})

      // Add title
      doc.fontSize(20).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Export`, { align: "center" })
      doc.moveDown()

      // Add date
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" })
      doc.moveDown()

      // Add table headers
      const startY = doc.y
      let currentY = startY
      const rowHeight = 20
      const colWidth = 70

      // Draw headers
      doc.fontSize(10).fillColor("black")
      headers.forEach((header, index) => {
        doc.text(header, 50 + index * colWidth, currentY, { width: colWidth - 5, ellipsis: true })
      })

      currentY += rowHeight
      doc
        .moveTo(50, currentY)
        .lineTo(50 + headers.length * colWidth, currentY)
        .stroke()

      // Add data rows
      result.rows.forEach((row, rowIndex) => {
        if (currentY > 700) {
          doc.addPage()
          currentY = 50
        }

        headers.forEach((header, colIndex) => {
          let value = row[header]
          if (value instanceof Date) {
            value = value.toLocaleDateString()
          } else if (Array.isArray(value)) {
            value = value.join(", ")
          } else if (value === null || value === undefined) {
            value = ""
          } else {
            value = String(value)
          }

          doc.text(value, 50 + colIndex * colWidth, currentY, { width: colWidth - 5, ellipsis: true })
        })

        currentY += rowHeight
      })

      doc.end()

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
      })
    } else if (format === "excel") {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(result.rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, type)

      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      })
    } else {
      // CSV format
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
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
