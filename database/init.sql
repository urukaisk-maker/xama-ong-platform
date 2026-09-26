CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO roles (name) VALUES
    ('junta'),('coordinador_reus'),('coordinador_tarragona'),
    ('voluntario'),('servicios_sociales');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    site VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'kg',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    origin VARCHAR(100) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity >= 0),
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'disponible',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(50) UNIQUE NOT NULL,
    adults INTEGER DEFAULT 0,
    minors INTEGER DEFAULT 0,
    dietary_restrictions TEXT,
    site VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    delivery_date DATE NOT NULL,
    site VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nevera_rations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    target_rations INTEGER DEFAULT 20,
    served_rations INTEGER DEFAULT 0
);
