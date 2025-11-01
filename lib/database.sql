-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'guest' CHECK (role IN ('super_admin', 'admin', 'guest')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP table for authentication
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(15) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tehsils table
CREATE TABLE IF NOT EXISTS tehsils (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district_id INTEGER REFERENCES districts(id)
);

-- Mandals table
CREATE TABLE IF NOT EXISTS mandals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tehsil_id INTEGER REFERENCES tehsils(id)
);

-- Grh Sampar form data
CREATE TABLE IF NOT EXISTS grh_sampar_forms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    district_id INTEGER REFERENCES districts(id),
    tehsil_id INTEGER REFERENCES tehsils(id),
    mandal_id INTEGER REFERENCES mandals(id),
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    hobby TEXT,
    location TEXT,
    work TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vitrit Savaymsevak table
CREATE TABLE IF NOT EXISTS vitrit_savaymsevak (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name_hindi VARCHAR(255) NOT NULL,
    location_hindi VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    age INTEGER NOT NULL,
    class_profession_hindi VARCHAR(255) NOT NULL,
    responsibility_hindi VARCHAR(255) NOT NULL,
    district_id INTEGER REFERENCES districts(id),
    tehsil_id INTEGER REFERENCES tehsils(id),
    mandal_id INTEGER REFERENCES mandals(id),
    responsibility_details_hindi TEXT,
    sangh_shikshan_hindi VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Team (Abhiyan Toli) table
CREATE TABLE IF NOT EXISTS campaign_teams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    district_id INTEGER REFERENCES districts(id),
    tehsil_id INTEGER REFERENCES tehsils(id),
    mandal_id INTEGER REFERENCES mandals(id),
    location VARCHAR(255),
    team_number INTEGER,
    team_leader VARCHAR(255),
    leader_phone VARCHAR(15),
    assistant_leader VARCHAR(255),
    assistant_phone VARCHAR(15),
    member1 VARCHAR(255),
    member1_phone VARCHAR(15),
    member2 VARCHAR(255),
    member2_phone VARCHAR(15),
    member3 VARCHAR(255),
    member3_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mandal Team table
CREATE TABLE IF NOT EXISTS mandal_teams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    district_id INTEGER REFERENCES districts(id),
    tehsil_id INTEGER REFERENCES tehsils(id),
    mandal_id INTEGER REFERENCES mandals(id),
    mandal_leader VARCHAR(255),
    leader_phone VARCHAR(15),
    mandal_secretary VARCHAR(255),
    secretary_phone VARCHAR(15),
    member1 VARCHAR(255),
    member1_phone VARCHAR(15),
    member2 VARCHAR(255),
    member2_phone VARCHAR(15),
    member3 VARCHAR(255),
    member3_phone VARCHAR(15),
    member4 VARCHAR(255),
    member4_phone VARCHAR(15),
    member5 VARCHAR(255),
    member5_phone VARCHAR(15),
    member6 VARCHAR(255),
    member6_phone VARCHAR(15),
    member7 VARCHAR(255),
    member7_phone VARCHAR(15),
    member8 VARCHAR(255),
    member8_phone VARCHAR(15),
    member9 VARCHAR(255),
    member9_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default districts
INSERT INTO districts (name) VALUES 
('ग्वालियर'),
('भिंड'),
('शिवपुरी'),
('गुना'),
('अशोकनगर'),
('सीहोर'),
('रतलाम'),
('उज्जैन'),
('मंदसौर'),
('नीमच'),
('मध्यपुरी'),
('दतिया'),
('शाजापुर'),
('अलीराजपुर'),
('बड़वानी'),
('खरगोन'),
('बरवानी'),
('धार'),
('इंदौर'),
('बैतूल'),
('छिंदवाड़ा'),
('होशंगाबाद'),
('सीहोर'),
('रायसेन'),
('आगर मालवा'),
('राजगढ़'),
('विदिशा'),
('सागर'),
('दमोह'),
('चतरपुर'),
('टीकमगढ़'),
('पन्ना'),
('सतना'),
('रीवा'),
('सिवानी'),
('भोपाल'),
('हरदा'),
('बेतूल'),
('अमरोहा'),
('मुरैनां'),
('शाहडोल'),
('सिंहगढ़'),
('अगरतला'),
('जबलपुर'),
('नरसिंहपुर'),
('कटनी'),
('उमरिया'),
('अनूपपुर'),
('डिंडोरी'),
('मंडला'),
('बालाघाट'),
('सेहोर'),
('सिरमौर'),
('सीकर'),
('धौलपुर')
ON CONFLICT DO NOTHING;

-- Insert tehsils for Gwalior district (district_id = 1)
INSERT INTO tehsils (name, district_id) VALUES 
('ग्वालियर', 1),
('दोहा', 1),
('पचमढ़ी', 1),
('सागर', 1),
('बेरचा', 1),
('लाहर', 1),
('भिटार', 1),
('चंदेरी', 1),
('महाराजपुर', 1),
('मेहगांव', 1),
('बावरी', 1),
('गुरुवारा', 1),
('हरदेहाट', 1),
('इंदौर', 1),
('कामरा', 1),
('गोरावा', 1),
('सिवनी', 1),
('करवा', 1),
('सरोजनीनगर', 1),
('मानवार', 1),
('सालरीगंज', 1),
('मालगढ़', 1),
('कोटरा', 1),
('गोपाद्री', 1),
('कालापीपल', 1),
('कुलुम', 1),
('बाबरी', 1),
('चौचौरा', 1),
('मुरार', 1),
('मालवा', 1),
('महाराजगंज', 1),
('भानपुरा', 1),
('शिवराजपुर', 1),
('शिवपुरी', 1),
('शाहपुरा', 1),
('सुखचीरा', 1),
('रामचंद्रपुर', 1),
('सागरी', 1)
ON CONFLICT DO NOTHING;

-- Insert mandals for Gwalior tehsil (tehsil_id = 1)
INSERT INTO mandals (name, tehsil_id) VALUES 
('ग्वालियर नगर', 1),
('मालवा नगर', 1),
('सिवनी मंडी', 1),
('करवा', 1),
('सरोजनीनगर', 1),
('मानवार', 1),
('सालरीगंज', 1),
('मालगढ़', 1),
('कोटरा', 1),
('गोपाद्री', 1),
('कालापीपल', 1),
('कुलुम', 1),
('बाबरी', 1),
('चौचौरा', 1),
('मुरार', 1),
('मालवा', 1),
('महाराजगंज', 1),
('भानपुरा', 1),
('शिवराजपुर', 1),
('शिवपुरी', 1),
('शाहपुरा', 1),
('सुखचीरा', 1),
('रामचंद्रपुर', 1),
('सागरी', 1)
ON CONFLICT DO NOTHING;

-- Create super admin user (password: 123456789)
INSERT INTO users (name, mobile, email, password, role, is_verified) VALUES 
('Super Admin', '9999999999', 'admin@example.com', '$2b$10$rQZ8K9LmN3pO4qR5sT6uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q', 'super_admin', true)
ON CONFLICT (mobile) DO NOTHING;