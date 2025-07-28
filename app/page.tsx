"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Settings,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Cloud,
  Shield,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"

interface Booking {
  id: string
  agency: string
  hotel: string
  city: string
  checkIn: string
  checkOut: string
  rooms: number
  guests: number
  status: "confirmed" | "pending" | "cancelled"
}

interface Hotel {
  id: number
  name: string
  city: string
  rating: number
  image: string
  amenities: string[]
}

interface City {
  id: number
  name: string
  country: string
  description: string
  image: string
  isActive: boolean
  createdAt: string
}

export default function CostaVoyageApp() {
  const [activeTab, setActiveTab] = useState("bookings")
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing">("synced")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false)
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [deletingCity, setDeletingCity] = useState<City | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadBookings()
    loadHotels()
    loadCities()
  }, [])

  const loadBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast({ title: "Error", description: "Failed to load bookings", variant: "destructive" })
    }
  }

  const loadHotels = async () => {
    try {
      const response = await fetch("/api/hotels")
      if (response.ok) {
        const data = await response.json()
        setHotels(data)
      }
    } catch (error) {
      console.error("Error loading hotels:", error)
      toast({ title: "Error", description: "Failed to load hotels", variant: "destructive" })
    }
  }

  const loadCities = async () => {
    try {
      const response = await fetch("/api/cities")
      if (response.ok) {
        const data = await response.json()
        setCities(data)
      }
    } catch (error) {
      console.error("Error loading cities:", error)
      toast({ title: "Error", description: "Failed to load cities", variant: "destructive" })
    }
  }

  const handleAddBooking = async (formData: FormData) => {
    const newBooking = {
      agency: formData.get("agency") as string,
      hotel: formData.get("hotel") as string,
      city: formData.get("city") as string,
      checkIn: formData.get("checkin") as string,
      checkOut: formData.get("checkout") as string,
      rooms: Number.parseInt(formData.get("rooms") as string),
      guests: Number.parseInt(formData.get("guests") as string),
      status: formData.get("status") as "confirmed" | "pending" | "cancelled",
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      })

      if (response.ok) {
        const booking = await response.json()
        setBookings((prev) => [...prev, booking])
        setIsBookingDialogOpen(false)
        toast({ title: "Success", description: "Booking added successfully!" })
      } else {
        throw new Error("Failed to add booking")
      }
    } catch (error) {
      console.error("Error adding booking:", error)
      toast({ title: "Error", description: "Failed to add booking", variant: "destructive" })
    }
  }

  const handleAddHotel = async (formData: FormData) => {
    const newHotel = {
      name: formData.get("hotel-name") as string,
      city: formData.get("hotel-city") as string,
      rating: Number.parseInt(formData.get("hotel-rating") as string),
      phone: formData.get("hotel-phone") as string,
      address: formData.get("hotel-address") as string,
      amenities: (formData.get("hotel-amenities") as string).split(",").map((a) => a.trim()),
      description: formData.get("hotel-description") as string,
    }

    try {
      const response = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHotel),
      })

      if (response.ok) {
        const hotel = await response.json()
        setHotels((prev) => [...prev, hotel])
        setIsHotelDialogOpen(false)
        toast({ title: "Success", description: "Hotel added successfully!" })
      } else {
        throw new Error("Failed to add hotel")
      }
    } catch (error) {
      console.error("Error adding hotel:", error)
      toast({ title: "Error", description: "Failed to add hotel", variant: "destructive" })
    }
  }

  const handleAddCity = async (formData: FormData) => {
    const cityData = {
      name: formData.get("city-name") as string,
      country: formData.get("city-country") as string,
      description: formData.get("city-description") as string,
      isActive: formData.get("city-active") === "on",
    }

    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cityData),
      })

      if (response.ok) {
        const city = await response.json()
        setCities((prev) => [...prev, city])
        setIsCityDialogOpen(false)
        toast({ title: "Success", description: "City added successfully!" })
      } else {
        throw new Error("Failed to add city")
      }
    } catch (error) {
      console.error("Error adding city:", error)
      toast({ title: "Error", description: "Failed to add city", variant: "destructive" })
    }
  }

  const handleEditCity = async (formData: FormData) => {
    if (!editingCity) return

    const cityData = {
      name: formData.get("city-name") as string,
      country: formData.get("city-country") as string,
      description: formData.get("city-description") as string,
      isActive: formData.get("city-active") === "on",
    }

    try {
      const response = await fetch(`/api/cities/${editingCity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cityData),
      })

      if (response.ok) {
        const updatedCity = await response.json()
        setCities((prev) => prev.map((city) => (city.id === editingCity.id ? updatedCity : city)))
        setEditingCity(null)
        toast({ title: "Success", description: "City updated successfully!" })
      } else {
        throw new Error("Failed to update city")
      }
    } catch (error) {
      console.error("Error updating city:", error)
      toast({ title: "Error", description: "Failed to update city", variant: "destructive" })
    }
  }

  const handleDeleteCity = async () => {
    if (!deletingCity) return

    try {
      const response = await fetch(`/api/cities/${deletingCity.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCities((prev) => prev.filter((city) => city.id !== deletingCity.id))
        setDeletingCity(null)
        toast({ title: "Success", description: "City deleted successfully!" })
      } else {
        throw new Error("Failed to delete city")
      }
    } catch (error) {
      console.error("Error deleting city:", error)
      toast({ title: "Error", description: "Failed to delete city", variant: "destructive" })
    }
  }

  const handleExportData = async (type: "excel" | "pdf", dataType: "bookings" | "hotels") => {
    try {
      setSyncStatus("syncing")
      const response = await fetch(`/api/export/${dataType}?format=${type}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${dataType}_export.${type === "excel" ? "xlsx" : "csv"}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({ title: "Success", description: `${dataType} exported successfully!` })
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({ title: "Error", description: "Export failed", variant: "destructive" })
    } finally {
      setSyncStatus("synced")
    }
  }

  const handleBackup = async () => {
    try {
      setSyncStatus("syncing")
      const response = await fetch("/api/admin/backup", { method: "POST" })

      if (response.ok) {
        toast({ title: "Success", description: "Backup completed successfully!" })
      } else {
        throw new Error("Backup failed")
      }
    } catch (error) {
      console.error("Backup error:", error)
      toast({ title: "Error", description: "Backup failed", variant: "destructive" })
    } finally {
      setSyncStatus("synced")
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotel.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = selectedCity === "all" || booking.city === selectedCity
    return matchesSearch && matchesCity
  })

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = selectedCity === "all" || hotel.city === selectedCity
    return matchesSearch && matchesCity
  })

  const activeCities = cities.filter((city) => city.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src="/costa-voyage-logo.png" alt="Costa Voyage Logo" className="h-12 w-auto" />
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Button
                variant={activeTab === "bookings" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("bookings")}
                className="text-white hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </Button>
              <Button
                variant={activeTab === "hotels" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("hotels")}
                className="text-white hover:bg-blue-700"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Hotels
              </Button>
              <Button
                variant={activeTab === "tours" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("tours")}
                className="text-white hover:bg-blue-700"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Tours
              </Button>
              <Button
                variant={activeTab === "admin" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("admin")}
                className="text-white hover:bg-blue-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${syncStatus === "synced" ? "bg-green-400" : "bg-yellow-400"}`}
                ></div>
                <span className="text-sm text-blue-200">{syncStatus === "synced" ? "Synced" : "Syncing..."}</span>
              </div>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>CV</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar - Only on Bookings Page */}
        {activeTab === "bookings" && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings, hotels, or agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {activeCities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Hotel Bookings</h2>
              <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                    <DialogDescription>Fill in the details for a new hotel booking</DialogDescription>
                  </DialogHeader>
                  <form action={handleAddBooking}>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="agency">Travel Agency</Label>
                        <Input id="agency" name="agency" placeholder="Enter agency name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hotel">Hotel</Label>
                        <Select name="hotel" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hotel" />
                          </SelectTrigger>
                          <SelectContent>
                            {hotels.map((hotel) => (
                              <SelectItem key={hotel.id} value={hotel.name}>
                                {hotel.name} - {hotel.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select name="city" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeCities.map((city) => (
                              <SelectItem key={city.id} value={city.name}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkin">Check-in Date</Label>
                        <Input id="checkin" name="checkin" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkout">Check-out Date</Label>
                        <Input id="checkout" name="checkout" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rooms">Number of Rooms</Label>
                        <Input
                          id="rooms"
                          name="rooms"
                          type="number"
                          placeholder="Enter number of rooms"
                          min="1"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guests">Number of Guests</Label>
                        <Input id="guests" name="guests" type="number" placeholder="Enter guest count" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Booking Status</Label>
                        <Select name="status" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="notes">Special Requests</Label>
                        <Textarea id="notes" name="notes" placeholder="Any special requirements or notes..." />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Create Booking
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage and track all hotel reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Rooms/Guests</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.agency}</TableCell>
                        <TableCell>{booking.hotel}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                            {booking.city}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{booking.checkIn}</div>
                            <div className="text-gray-500">to {booking.checkOut}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span>{booking.rooms}</span>
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{booking.guests}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Booking
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hotels Tab */}
        {activeTab === "hotels" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Hotel Directory</h2>
              <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hotel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Hotel</DialogTitle>
                    <DialogDescription>Fill in the details for a new hotel</DialogDescription>
                  </DialogHeader>
                  <form action={handleAddHotel}>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="hotel-name">Hotel Name</Label>
                        <Input id="hotel-name" name="hotel-name" placeholder="Enter hotel name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hotel-city">City</Label>
                        <Select name="hotel-city" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeCities.map((city) => (
                              <SelectItem key={city.id} value={city.name}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hotel-rating">Star Rating</Label>
                        <Select name="hotel-rating" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Star</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hotel-phone">Phone Number</Label>
                        <Input id="hotel-phone" name="hotel-phone" placeholder="Enter phone number" required />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="hotel-address">Address</Label>
                        <Input id="hotel-address" name="hotel-address" placeholder="Enter hotel address" required />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="hotel-amenities">Amenities</Label>
                        <Textarea
                          id="hotel-amenities"
                          name="hotel-amenities"
                          placeholder="Enter amenities (separated by commas)"
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="hotel-description">Description</Label>
                        <Textarea
                          id="hotel-description"
                          name="hotel-description"
                          placeholder="Enter hotel description"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsHotelDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Add Hotel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={hotel.image || "/placeholder.svg?height=200&width=300"}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-blue-600">{"★".repeat(hotel.rating)}</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{hotel.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {hotel.city}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Book Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tours Tab */}
        {activeTab === "tours" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Tour Packages</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Tour
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Santorini Sunset Tour"
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Santorini Sunset & Wine Tour</CardTitle>
                  <CardDescription>Experience the famous Santorini sunset with local wine tasting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>6 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group Size:</span>
                      <span>Max 12 people</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">View Details</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Mykonos Island Hopping"
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Mykonos Island Hopping Adventure</CardTitle>
                  <CardDescription>Discover hidden beaches and traditional villages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>Full Day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Group Size:</span>
                      <span>Max 20 people</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">View Details</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">System Administration</h2>

            {/* Cities Management Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                    Cities Management
                  </div>
                  <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add City
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New City</DialogTitle>
                        <DialogDescription>Add a new destination city to the system</DialogDescription>
                      </DialogHeader>
                      <form action={handleAddCity}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="city-name">City Name</Label>
                            <Input id="city-name" name="city-name" placeholder="Enter city name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city-country">Country</Label>
                            <Input id="city-country" name="city-country" placeholder="Enter country" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city-description">Description</Label>
                            <Textarea
                              id="city-description"
                              name="city-description"
                              placeholder="Enter city description"
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="city-active" name="city-active" defaultChecked />
                            <Label htmlFor="city-active">Active</Label>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsCityDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Add City
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>Manage destination cities for hotels and tours</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">{city.name}</TableCell>
                        <TableCell>{city.country}</TableCell>
                        <TableCell>
                          <Badge variant={city.isActive ? "default" : "secondary"}>
                            {city.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(city.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingCity(city)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingCity(city)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sync Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                    Network Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Auto Sync</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Sync:</span>
                    <span className="text-sm text-gray-500">2 minutes ago</span>
                  </div>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => {
                      setSyncStatus("syncing")
                      setTimeout(() => setSyncStatus("synced"), 2000)
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                </CardContent>
              </Card>

              {/* Backup & Restore Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cloud className="w-5 h-5 mr-2 text-blue-600" />
                    Backup & Restore
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Daily Backup</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Backup:</span>
                    <span className="text-sm text-gray-500">Today 3:00 AM</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={handleBackup}
                      disabled={syncStatus === "syncing"}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {syncStatus === "syncing" ? "Processing..." : "Create Backup"}
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Export Options Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">Export booking data and reports</p>
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={() => handleExportData("excel", "bookings")}
                      disabled={syncStatus === "syncing"}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export Bookings to Excel
                    </Button>
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={() => handleExportData("excel", "hotels")}
                      disabled={syncStatus === "syncing"}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export Hotels to Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User Management Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Users:</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Users:</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Two-Factor Auth</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Session Timeout</span>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15m</SelectItem>
                        <SelectItem value="30">30m</SelectItem>
                        <SelectItem value="60">1h</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Security Audit
                  </Button>
                </CardContent>
              </Card>

              {/* System Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    System Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Version:</span>
                    <span className="font-semibold">v2.1.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <Badge variant="outline" className="text-green-600">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage:</span>
                    <span className="text-sm">2.3GB / 10GB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Edit City Dialog */}
      <Dialog open={!!editingCity} onOpenChange={() => setEditingCity(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>Update city information</DialogDescription>
          </DialogHeader>
          {editingCity && (
            <form action={handleEditCity}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city-name">City Name</Label>
                  <Input
                    id="edit-city-name"
                    name="city-name"
                    defaultValue={editingCity.name}
                    placeholder="Enter city name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city-country">Country</Label>
                  <Input
                    id="edit-city-country"
                    name="city-country"
                    defaultValue={editingCity.country}
                    placeholder="Enter country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city-description">Description</Label>
                  <Textarea
                    id="edit-city-description"
                    name="city-description"
                    defaultValue={editingCity.description}
                    placeholder="Enter city description"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="edit-city-active" name="city-active" defaultChecked={editingCity.isActive} />
                  <Label htmlFor="edit-city-active">Active</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingCity(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update City
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete City Confirmation Dialog */}
      <AlertDialog open={!!deletingCity} onOpenChange={() => setDeletingCity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete City</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCity?.name}"? This action cannot be undone and will affect all
              related bookings and hotels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCity} className="bg-red-600 hover:bg-red-700">
              Delete City
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/costa-voyage-logo.png" alt="Costa Voyage Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold">Costa Voyage</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Costa Voyage Travel Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
