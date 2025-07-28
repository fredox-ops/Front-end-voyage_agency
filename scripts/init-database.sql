-- Create database
CREATE DATABASE IF NOT EXISTS costa_voyage;

-- Use the database
\c costa_voyage;

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    phone VARCHAR(20),
    address TEXT,
    amenities TEXT[],
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    agency VARCHAR(200) NOT NULL,
    hotel VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    rooms INTEGER NOT NULL CHECK (rooms > 0),
    guests INTEGER NOT NULL CHECK (guests > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tours table
CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    duration VARCHAR(50),
    max_participants INTEGER,
    price DECIMAL(10,2),
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_city ON bookings(city);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_rating ON hotels(rating);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_city ON tours(city);

-- Add foreign key constraints (optional, for data integrity)
-- ALTER TABLE bookings ADD CONSTRAINT fk_booking_city FOREIGN KEY (city) REFERENCES cities(name);
-- ALTER TABLE hotels ADD CONSTRAINT fk_hotel_city FOREIGN KEY (city) REFERENCES cities(name);
-- ALTER TABLE tours ADD CONSTRAINT fk_tour_city FOREIGN KEY (city) REFERENCES cities(name);

COMMENT ON TABLE cities IS 'Destination cities for travel bookings';
COMMENT ON TABLE hotels IS 'Hotel directory with ratings and amenities';
COMMENT ON TABLE bookings IS 'Hotel booking records from travel agencies';
COMMENT ON TABLE tours IS 'Tour packages available in different cities';
