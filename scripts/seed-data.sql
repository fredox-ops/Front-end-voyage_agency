-- Insert sample cities first
INSERT INTO cities (name, country, description, is_active) VALUES
('Santorini', 'Greece', 'Famous for its stunning sunsets, white-washed buildings, and volcanic beaches', true),
('Mykonos', 'Greece', 'Known for its vibrant nightlife, beautiful beaches, and traditional Cycladic architecture', true),
('Crete', 'Greece', 'The largest Greek island with rich history, beautiful beaches, and ancient Minoan sites', true),
('Rhodes', 'Greece', 'Medieval city with UNESCO World Heritage sites and beautiful beaches', true),
('Athens', 'Greece', 'The historic capital of Greece with ancient monuments and modern attractions', true),
('Paros', 'Greece', 'Charming island with traditional villages and crystal-clear waters', true),
('Naxos', 'Greece', 'Largest of the Cyclades with beautiful beaches and ancient ruins', false);

-- Insert sample hotels
INSERT INTO hotels (name, city, rating, phone, address, amenities, description) VALUES
('Grand Hotel Poseidon', 'Santorini', 5, '+30 22860 71234', 'Oia, Santorini 84702, Greece', 
 ARRAY['Pool', 'Spa', 'Restaurant', 'WiFi', 'Sea View'], 
 'Luxury resort with stunning caldera views and world-class amenities'),

('Villa Costa Marina', 'Mykonos', 4, '+30 22890 23456', 'Paradise Beach, Mykonos 84600, Greece', 
 ARRAY['Pool', 'Beach Access', 'Restaurant', 'WiFi'], 
 'Beachfront hotel with vibrant nightlife and beautiful sea views'),

('Sunset Resort & Spa', 'Crete', 5, '+30 28210 34567', 'Heraklion, Crete 71202, Greece', 
 ARRAY['Spa', 'Multiple Pools', 'Beach', 'All-Inclusive', 'Kids Club'], 
 'Family-friendly resort with comprehensive facilities and entertainment'),

('Aegean Palace Hotel', 'Rhodes', 4, '+30 22410 45678', 'Rhodes Old Town, Rhodes 85100, Greece', 
 ARRAY['WiFi', 'Restaurant', 'Bar', 'Historical Location'], 
 'Historic hotel in the heart of Rhodes Old Town'),

('Athens Grand Hotel', 'Athens', 5, '+30 210 5678901', 'Syntagma Square, Athens 10563, Greece', 
 ARRAY['WiFi', 'Business Center', 'Restaurant', 'Gym', 'City View'], 
 'Luxury hotel in the center of Athens with modern amenities');

-- Insert sample bookings
INSERT INTO bookings (agency, hotel, city, check_in, check_out, rooms, guests, status, notes) VALUES
('Mediterranean Tours Ltd', 'Grand Hotel Poseidon', 'Santorini', '2024-08-15', '2024-08-22', 2, 4, 'confirmed', 'Honeymoon suite requested'),
('Aegean Adventures', 'Villa Costa Marina', 'Mykonos', '2024-08-20', '2024-08-25', 1, 2, 'pending', 'Sea view room preferred'),
('Blue Wave Travel', 'Sunset Resort & Spa', 'Crete', '2024-08-20', '2024-08-25', 1, 2, 'pending', 'Sea view room preferred'),
('Blue Wave Travel', 'Sunset Resort & Spa', 'Crete', '2024-08-18', '2024-08-28', 3, 6, 'confirmed', 'Family vacation with children'),
('Island Dreams Travel', 'Grand Hotel Poseidon', 'Santorini', '2024-08-10', '2024-08-15', 1, 2, 'cancelled', 'Client cancelled due to weather concerns'),
('Greek Island Tours', 'Aegean Palace Hotel', 'Rhodes', '2024-09-01', '2024-09-07', 2, 3, 'confirmed', 'Historical tour package'),
('Cyclades Travel', 'Athens Grand Hotel', 'Athens', '2024-09-15', '2024-09-18', 1, 1, 'pending', 'Business trip accommodation');

-- Insert sample tours
INSERT INTO tours (name, destination, duration, group_size, description) VALUES
('Santorini Sunset & Wine Tour', 'Santorini', '6 hours', 'Max 12 people', 'Experience the famous Santorini sunset with local wine tasting at traditional wineries'),
('Mykonos Island Hopping Adventure', 'Mykonos', 'Full Day', 'Max 20 people', 'Discover hidden beaches and traditional villages around the beautiful Cyclades islands'),
('Crete Archaeological Tour', 'Crete', '8 hours', 'Max 15 people', 'Explore ancient Minoan civilization sites including Knossos Palace and Heraklion Museum'),
('Rhodes Medieval City Walk', 'Rhodes', '4 hours', 'Max 25 people', 'Guided tour through the UNESCO World Heritage medieval city of Rhodes'),
('Athens Acropolis & Museum Tour', 'Athens', '5 hours', 'Max 30 people', 'Visit the iconic Acropolis and the modern Acropolis Museum with expert guides');

-- Insert sample admin user (password should be hashed in real application)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@costavoyage.com', '$2b$10$example_hash_here', 'admin'),
('manager', 'manager@costavoyage.com', '$2b$10$example_hash_here', 'user');

-- Insert sample backup record
INSERT INTO backups (filename, status) VALUES
('costa_voyage_backup_2024-01-15T10-30-00.sql', 'completed');
