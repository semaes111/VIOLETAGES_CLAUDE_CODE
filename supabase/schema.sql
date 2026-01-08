-- ============================================================================
-- VIOLETAEST - SCHEMA COMPLETO PARA SUPABASE
-- Ejecutar este script en Supabase Dashboard > SQL Editor
-- ============================================================================

-- Crear schema
CREATE SCHEMA IF NOT EXISTS violeta_gest;

-- Establecer schema por defecto para esta sesión
SET search_path TO violeta_gest, public;

-- ============================================================================
-- TIPOS ENUMERADOS
-- ============================================================================

CREATE TYPE violeta_gest.patient_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE violeta_gest.treatment_type AS ENUM ('medical', 'aesthetic', 'cosmetic');
CREATE TYPE violeta_gest.payment_method AS ENUM ('cash', 'card', 'transfer');
CREATE TYPE violeta_gest.expense_category AS ENUM ('supplies', 'equipment', 'rent', 'utilities', 'marketing', 'salaries', 'other');

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- Tabla: Categorías de tratamientos
CREATE TABLE violeta_gest.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type violeta_gest.treatment_type NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_type ON violeta_gest.categories(type);
CREATE INDEX idx_categories_active ON violeta_gest.categories(is_active);

-- Tabla: Pacientes
CREATE TABLE violeta_gest.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    dni VARCHAR(20),
    birth_date DATE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    first_visit_date DATE DEFAULT CURRENT_DATE,
    status violeta_gest.patient_status DEFAULT 'active',
    notes TEXT,
    medical_history TEXT,
    allergies TEXT,
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    photo_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_patients_name ON violeta_gest.patients(name);
CREATE INDEX idx_patients_phone ON violeta_gest.patients(phone);
CREATE INDEX idx_patients_email ON violeta_gest.patients(email);
CREATE INDEX idx_patients_status ON violeta_gest.patients(status);
CREATE INDEX idx_patients_first_visit ON violeta_gest.patients(first_visit_date);

-- Tabla: Proveedores
CREATE TABLE violeta_gest.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    tax_id VARCHAR(20),
    payment_terms INTEGER DEFAULT 30, -- días
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_suppliers_name ON violeta_gest.suppliers(name);
CREATE INDEX idx_suppliers_active ON violeta_gest.suppliers(is_active);

-- Tabla: Tratamientos
CREATE TABLE violeta_gest.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category_id UUID REFERENCES violeta_gest.categories(id),
    type violeta_gest.treatment_type NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    base_time_mins INTEGER DEFAULT 30,
    complexity_score INTEGER DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 5),
    requires_consent BOOLEAN DEFAULT FALSE,
    consent_template TEXT,
    aftercare_instructions TEXT,
    contraindications TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_treatments_code ON violeta_gest.treatments(code);
CREATE INDEX idx_treatments_name ON violeta_gest.treatments(name);
CREATE INDEX idx_treatments_category ON violeta_gest.treatments(category_id);
CREATE INDEX idx_treatments_type ON violeta_gest.treatments(type);
CREATE INDEX idx_treatments_active ON violeta_gest.treatments(is_active);

-- Tabla: Productos
CREATE TABLE violeta_gest.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE,
    name VARCHAR(200) NOT NULL,
    supplier_id UUID REFERENCES violeta_gest.suppliers(id),
    category_id UUID REFERENCES violeta_gest.categories(id),
    description TEXT,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    margin_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN sale_price > 0 THEN ((sale_price - cost_price) / sale_price * 100) ELSE 0 END
    ) STORED,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    max_stock INTEGER DEFAULT 100,
    unit VARCHAR(20) DEFAULT 'unidad',
    batch_number VARCHAR(50),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_code ON violeta_gest.products(code);
CREATE INDEX idx_products_name ON violeta_gest.products(name);
CREATE INDEX idx_products_supplier ON violeta_gest.products(supplier_id);
CREATE INDEX idx_products_active ON violeta_gest.products(is_active);
CREATE INDEX idx_products_low_stock ON violeta_gest.products(stock) WHERE stock <= min_stock;

-- Tabla: Transacciones (Ingresos)
CREATE TABLE violeta_gest.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    patient_id UUID REFERENCES violeta_gest.patients(id) ON DELETE SET NULL,

    -- Totales
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_reason VARCHAR(200),

    -- Desglose por método de pago
    cash_amount DECIMAL(10,2) DEFAULT 0,
    card_amount DECIMAL(10,2) DEFAULT 0,
    transfer_amount DECIMAL(10,2) DEFAULT 0,

    -- Desglose por tipo de servicio
    medical_amount DECIMAL(10,2) DEFAULT 0,
    aesthetic_amount DECIMAL(10,2) DEFAULT 0,
    cosmetic_amount DECIMAL(10,2) DEFAULT 0,

    -- Metadatos
    invoice_number VARCHAR(50),
    is_first_visit BOOLEAN DEFAULT FALSE,
    professional VARCHAR(100),
    notes TEXT,

    -- Auditoría
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Restricciones
    CONSTRAINT chk_total_payment CHECK (
        ABS(total_amount - discount_amount - (cash_amount + card_amount + transfer_amount)) < 0.01
    ),
    CONSTRAINT chk_total_type CHECK (
        ABS(total_amount - discount_amount - (medical_amount + aesthetic_amount + cosmetic_amount)) < 0.01
    )
);

CREATE INDEX idx_transactions_date ON violeta_gest.transactions(date);
CREATE INDEX idx_transactions_patient ON violeta_gest.transactions(patient_id);
CREATE INDEX idx_transactions_first_visit ON violeta_gest.transactions(is_first_visit);
CREATE INDEX idx_transactions_date_range ON violeta_gest.transactions(date DESC);

-- Tabla: Items de transacción
CREATE TABLE violeta_gest.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES violeta_gest.transactions(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES violeta_gest.treatments(id),
    product_id UUID REFERENCES violeta_gest.products(id),

    description VARCHAR(200),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) GENERATED ALWAYS AS (subtotal - cost) STORED,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_item_type CHECK (
        (treatment_id IS NOT NULL AND product_id IS NULL) OR
        (treatment_id IS NULL AND product_id IS NOT NULL) OR
        (treatment_id IS NULL AND product_id IS NULL AND description IS NOT NULL)
    )
);

CREATE INDEX idx_transaction_items_transaction ON violeta_gest.transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_treatment ON violeta_gest.transaction_items(treatment_id);
CREATE INDEX idx_transaction_items_product ON violeta_gest.transaction_items(product_id);

-- Tabla: Gastos
CREATE TABLE violeta_gest.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id UUID REFERENCES violeta_gest.suppliers(id),
    category violeta_gest.expense_category NOT NULL,

    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    iva_pct DECIMAL(5,2) DEFAULT 21.00,
    iva_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount * iva_pct / 100) STORED,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount * (1 + iva_pct / 100)) STORED,

    invoice_number VARCHAR(50),
    invoice_date DATE,
    payment_method violeta_gest.payment_method,
    payment_date DATE,
    is_paid BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20), -- monthly, quarterly, yearly

    notes TEXT,
    attachment_url TEXT,

    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON violeta_gest.expenses(date);
CREATE INDEX idx_expenses_supplier ON violeta_gest.expenses(supplier_id);
CREATE INDEX idx_expenses_category ON violeta_gest.expenses(category);
CREATE INDEX idx_expenses_paid ON violeta_gest.expenses(is_paid);
CREATE INDEX idx_expenses_date_range ON violeta_gest.expenses(date DESC);

-- Tabla: Citas (para futuras implementaciones)
CREATE TABLE violeta_gest.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES violeta_gest.patients(id),
    treatment_id UUID REFERENCES violeta_gest.treatments(id),

    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_mins INTEGER,

    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    professional VARCHAR(100),
    room VARCHAR(50),

    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON violeta_gest.appointments(patient_id);
CREATE INDEX idx_appointments_start ON violeta_gest.appointments(start_time);
CREATE INDEX idx_appointments_status ON violeta_gest.appointments(status);

-- Tabla: Configuración del sistema
CREATE TABLE violeta_gest.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VISTAS MATERIALIZADAS
-- ============================================================================

-- Vista: Resumen diario
CREATE MATERIALIZED VIEW violeta_gest.daily_summary AS
SELECT
    date,
    COUNT(DISTINCT patient_id) as patients_count,
    COUNT(*) as transactions_count,
    SUM(total_amount) as total_revenue,
    SUM(cash_amount) as cash_revenue,
    SUM(card_amount) as card_revenue,
    SUM(transfer_amount) as transfer_revenue,
    SUM(medical_amount) as medical_revenue,
    SUM(aesthetic_amount) as aesthetic_revenue,
    SUM(cosmetic_amount) as cosmetic_revenue,
    COUNT(*) FILTER (WHERE is_first_visit = TRUE) as first_visits
FROM violeta_gest.transactions
GROUP BY date
ORDER BY date DESC;

CREATE UNIQUE INDEX idx_daily_summary_date ON violeta_gest.daily_summary(date);

-- Vista: Resumen mensual
CREATE MATERIALIZED VIEW violeta_gest.monthly_summary AS
SELECT
    DATE_TRUNC('month', date)::DATE as month,
    COUNT(DISTINCT patient_id) as unique_patients,
    COUNT(*) as transactions_count,
    SUM(total_amount) as total_revenue,
    SUM(cash_amount) as cash_revenue,
    SUM(card_amount) as card_revenue,
    SUM(transfer_amount) as transfer_revenue,
    SUM(medical_amount) as medical_revenue,
    SUM(aesthetic_amount) as aesthetic_revenue,
    SUM(cosmetic_amount) as cosmetic_revenue,
    COUNT(*) FILTER (WHERE is_first_visit = TRUE) as first_visits,
    AVG(total_amount) as avg_ticket
FROM violeta_gest.transactions
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

CREATE UNIQUE INDEX idx_monthly_summary_month ON violeta_gest.monthly_summary(month);

-- Vista: Rentabilidad por tratamiento
CREATE MATERIALIZED VIEW violeta_gest.treatment_profitability AS
SELECT
    t.id as treatment_id,
    t.name as treatment_name,
    t.type,
    c.name as category_name,
    COUNT(ti.id) as times_performed,
    COALESCE(SUM(ti.quantity), 0) as total_units,
    COALESCE(SUM(ti.subtotal), 0) as total_revenue,
    COALESCE(SUM(ti.profit), 0) as total_profit,
    COALESCE(AVG(ti.subtotal / NULLIF(ti.quantity, 0)), 0) as avg_price,
    COALESCE(AVG(ti.profit / NULLIF(ti.quantity, 0)), 0) as avg_profit_per_unit,
    CASE WHEN SUM(ti.subtotal) > 0
        THEN (SUM(ti.profit) / SUM(ti.subtotal) * 100)::DECIMAL(5,2)
        ELSE 0 END as profit_margin_pct,
    t.base_time_mins,
    t.complexity_score,
    CASE WHEN SUM(ti.quantity * t.base_time_mins) > 0
        THEN (SUM(ti.profit) / SUM(ti.quantity * t.base_time_mins))::DECIMAL(10,2)
        ELSE 0 END as profit_per_minute
FROM violeta_gest.treatments t
LEFT JOIN violeta_gest.transaction_items ti ON ti.treatment_id = t.id
LEFT JOIN violeta_gest.categories c ON t.category_id = c.id
GROUP BY t.id, t.name, t.type, c.name, t.base_time_mins, t.complexity_score;

CREATE UNIQUE INDEX idx_treatment_prof_id ON violeta_gest.treatment_profitability(treatment_id);

-- Vista: Gasto por proveedor
CREATE MATERIALIZED VIEW violeta_gest.supplier_spending AS
SELECT
    s.id as supplier_id,
    s.name as supplier_name,
    DATE_TRUNC('month', e.date)::DATE as month,
    DATE_TRUNC('year', e.date)::DATE as year,
    COALESCE(SUM(e.total_amount), 0) as total_spent,
    COUNT(e.id) as invoice_count,
    COALESCE(AVG(e.total_amount), 0) as avg_invoice_amount
FROM violeta_gest.suppliers s
LEFT JOIN violeta_gest.expenses e ON e.supplier_id = s.id
GROUP BY s.id, s.name, DATE_TRUNC('month', e.date), DATE_TRUNC('year', e.date);

-- Vista: Adherencia de pacientes
CREATE MATERIALIZED VIEW violeta_gest.patient_adherence AS
WITH first_visits AS (
    SELECT
        patient_id,
        MIN(date) as first_visit_date
    FROM violeta_gest.transactions
    WHERE is_first_visit = TRUE
    GROUP BY patient_id
),
return_visits AS (
    SELECT
        t.patient_id,
        fv.first_visit_date,
        COUNT(*) as total_visits,
        MAX(t.date) as last_visit_date,
        SUM(t.total_amount) as lifetime_value
    FROM violeta_gest.transactions t
    JOIN first_visits fv ON t.patient_id = fv.patient_id
    GROUP BY t.patient_id, fv.first_visit_date
)
SELECT
    DATE_TRUNC('month', first_visit_date)::DATE as cohort_month,
    COUNT(DISTINCT patient_id) as first_visit_count,
    COUNT(DISTINCT CASE WHEN total_visits > 1 THEN patient_id END) as returned_count,
    CASE WHEN COUNT(DISTINCT patient_id) > 0
        THEN (COUNT(DISTINCT CASE WHEN total_visits > 1 THEN patient_id END)::DECIMAL /
              COUNT(DISTINCT patient_id) * 100)::DECIMAL(5,2)
        ELSE 0 END as return_rate_pct,
    AVG(total_visits) as avg_visits,
    AVG(lifetime_value) as avg_lifetime_value
FROM return_visits
GROUP BY DATE_TRUNC('month', first_visit_date);

-- Vista: Tendencias estacionales
CREATE MATERIALIZED VIEW violeta_gest.seasonal_trends AS
SELECT
    EXTRACT(MONTH FROM tr.date)::INTEGER as month_number,
    TO_CHAR(tr.date, 'Month') as month_name,
    t.name as treatment_name,
    c.name as category_name,
    COUNT(*) as times_performed,
    COALESCE(SUM(ti.subtotal), 0) as total_revenue,
    COALESCE(AVG(ti.subtotal), 0) as avg_revenue
FROM violeta_gest.transactions tr
JOIN violeta_gest.transaction_items ti ON tr.id = ti.transaction_id
JOIN violeta_gest.treatments t ON ti.treatment_id = t.id
LEFT JOIN violeta_gest.categories c ON t.category_id = c.id
GROUP BY EXTRACT(MONTH FROM tr.date), TO_CHAR(tr.date, 'Month'), t.name, c.name
ORDER BY month_number, total_revenue DESC;

-- ============================================================================
-- FUNCIONES DE UTILIDAD
-- ============================================================================

-- Función para refrescar todas las vistas materializadas
CREATE OR REPLACE FUNCTION violeta_gest.refresh_all_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY violeta_gest.daily_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY violeta_gest.monthly_summary;
    REFRESH MATERIALIZED VIEW violeta_gest.treatment_profitability;
    REFRESH MATERIALIZED VIEW violeta_gest.supplier_spending;
    REFRESH MATERIALIZED VIEW violeta_gest.patient_adherence;
    REFRESH MATERIALIZED VIEW violeta_gest.seasonal_trends;
END;
$$ LANGUAGE plpgsql;

-- Función trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION violeta_gest.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular totales de transacción automáticamente
CREATE OR REPLACE FUNCTION violeta_gest.calculate_transaction_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_total DECIMAL(10,2);
    v_medical DECIMAL(10,2);
    v_aesthetic DECIMAL(10,2);
    v_cosmetic DECIMAL(10,2);
BEGIN
    -- Calcular totales desde items
    SELECT
        COALESCE(SUM(ti.subtotal), 0),
        COALESCE(SUM(CASE WHEN t.type = 'medical' THEN ti.subtotal ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.type = 'aesthetic' THEN ti.subtotal ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.type = 'cosmetic' THEN ti.subtotal ELSE 0 END), 0)
    INTO v_total, v_medical, v_aesthetic, v_cosmetic
    FROM violeta_gest.transaction_items ti
    LEFT JOIN violeta_gest.treatments t ON ti.treatment_id = t.id
    WHERE ti.transaction_id = COALESCE(NEW.transaction_id, OLD.transaction_id);

    -- Actualizar transacción
    UPDATE violeta_gest.transactions
    SET
        total_amount = v_total,
        medical_amount = v_medical,
        aesthetic_amount = v_aesthetic,
        cosmetic_amount = v_cosmetic
    WHERE id = COALESCE(NEW.transaction_id, OLD.transaction_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION violeta_gest.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year TEXT;
    v_sequence INTEGER;
BEGIN
    IF NEW.invoice_number IS NULL THEN
        v_year := TO_CHAR(NEW.date, 'YYYY');

        SELECT COALESCE(MAX(
            CAST(SUBSTRING(invoice_number FROM 'VG-\d{4}-(\d+)') AS INTEGER)
        ), 0) + 1
        INTO v_sequence
        FROM violeta_gest.transactions
        WHERE invoice_number LIKE 'VG-' || v_year || '-%';

        NEW.invoice_number := 'VG-' || v_year || '-' || LPAD(v_sequence::TEXT, 6, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar stock bajo
CREATE OR REPLACE FUNCTION violeta_gest.check_low_stock()
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR(200),
    current_stock INTEGER,
    min_stock INTEGER,
    supplier_name VARCHAR(200)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.stock,
        p.min_stock,
        s.name
    FROM violeta_gest.products p
    LEFT JOIN violeta_gest.suppliers s ON p.supplier_id = s.id
    WHERE p.stock <= p.min_stock AND p.is_active = TRUE
    ORDER BY (p.stock::DECIMAL / NULLIF(p.min_stock, 0)) ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de un paciente
CREATE OR REPLACE FUNCTION violeta_gest.get_patient_stats(p_patient_id UUID)
RETURNS TABLE (
    total_visits BIGINT,
    total_spent DECIMAL(10,2),
    avg_ticket DECIMAL(10,2),
    first_visit DATE,
    last_visit DATE,
    favorite_treatment VARCHAR(200),
    days_since_last_visit INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH patient_transactions AS (
        SELECT * FROM violeta_gest.transactions WHERE patient_id = p_patient_id
    ),
    favorite AS (
        SELECT t.name
        FROM violeta_gest.transaction_items ti
        JOIN violeta_gest.treatments t ON ti.treatment_id = t.id
        JOIN patient_transactions pt ON ti.transaction_id = pt.id
        GROUP BY t.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT
        COUNT(*)::BIGINT,
        COALESCE(SUM(total_amount), 0)::DECIMAL(10,2),
        COALESCE(AVG(total_amount), 0)::DECIMAL(10,2),
        MIN(date),
        MAX(date),
        (SELECT name FROM favorite),
        (CURRENT_DATE - MAX(date))::INTEGER
    FROM patient_transactions;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at en patients
CREATE TRIGGER trigger_patients_updated_at
    BEFORE UPDATE ON violeta_gest.patients
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.update_updated_at();

-- Trigger para updated_at en products
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON violeta_gest.products
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.update_updated_at();

-- Trigger para updated_at en treatments
CREATE TRIGGER trigger_treatments_updated_at
    BEFORE UPDATE ON violeta_gest.treatments
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.update_updated_at();

-- Trigger para updated_at en suppliers
CREATE TRIGGER trigger_suppliers_updated_at
    BEFORE UPDATE ON violeta_gest.suppliers
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.update_updated_at();

-- Trigger para updated_at en expenses
CREATE TRIGGER trigger_expenses_updated_at
    BEFORE UPDATE ON violeta_gest.expenses
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.update_updated_at();

-- Trigger para updated_at en transactions
CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON violeta_gest.transactions
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.update_updated_at();

-- Trigger para generar número de factura
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON violeta_gest.transactions
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.generate_invoice_number();

-- Trigger para recalcular totales cuando cambian items
CREATE TRIGGER trigger_recalculate_totals
    AFTER INSERT OR UPDATE OR DELETE ON violeta_gest.transaction_items
    FOR EACH ROW EXECUTE FUNCTION violeta_gest.calculate_transaction_totals();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE violeta_gest.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE violeta_gest.settings ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo a usuarios autenticados)
CREATE POLICY "Allow authenticated access" ON violeta_gest.patients
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.transactions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.transaction_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.treatments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.suppliers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.appointments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access" ON violeta_gest.settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Categorías por defecto
INSERT INTO violeta_gest.categories (name, type, description) VALUES
    ('Toxina Botulínica', 'medical', 'Tratamientos con toxina botulínica'),
    ('Rellenos Dérmicos', 'medical', 'Ácido hialurónico y otros rellenos'),
    ('Mesoterapia', 'medical', 'Tratamientos de mesoterapia facial y corporal'),
    ('Hilos Tensores', 'medical', 'Lifting con hilos tensores'),
    ('Láser Médico', 'medical', 'Tratamientos con láser médico'),
    ('Peelings Médicos', 'medical', 'Peelings químicos profundos'),
    ('Faciales', 'aesthetic', 'Tratamientos faciales estéticos'),
    ('Corporales', 'aesthetic', 'Tratamientos corporales estéticos'),
    ('Aparatología', 'aesthetic', 'Tratamientos con aparatología estética'),
    ('Depilación', 'aesthetic', 'Depilación láser y otros métodos'),
    ('Maquillaje', 'cosmetic', 'Servicios de maquillaje'),
    ('Cosmética Facial', 'cosmetic', 'Productos cosméticos faciales'),
    ('Cosmética Corporal', 'cosmetic', 'Productos cosméticos corporales');

-- Configuración inicial
INSERT INTO violeta_gest.settings (key, value, description) VALUES
    ('clinic_name', 'VioletaGest Clínica', 'Nombre de la clínica'),
    ('clinic_address', '', 'Dirección de la clínica'),
    ('clinic_phone', '', 'Teléfono de contacto'),
    ('clinic_email', '', 'Email de contacto'),
    ('clinic_tax_id', '', 'CIF/NIF de la clínica'),
    ('default_iva', '21', 'IVA por defecto'),
    ('invoice_prefix', 'VG', 'Prefijo para facturas'),
    ('appointment_duration', '30', 'Duración por defecto de citas (minutos)'),
    ('reminder_hours_before', '24', 'Horas antes para recordatorio de cita');

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Ejecutar refresh inicial de vistas (descomentar tras tener datos)
-- SELECT violeta_gest.refresh_all_views();

COMMENT ON SCHEMA violeta_gest IS 'Schema para VioletaGest - Sistema de Gestión de Clínica de Estética';
