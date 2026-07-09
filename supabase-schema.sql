-- ============================================
-- SCHEMA PARA FINANZAS IEUP
-- Iglesia Evangélica Unión Pentecostal
-- ============================================

-- 1. TABLA DE TEMPLOS (Centros de costo)
CREATE TABLE IF NOT EXISTS public.templos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ubicacion TEXT,
  telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLA DE CAJAS
CREATE TABLE IF NOT EXISTS public.cajas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'General',
  responsable VARCHAR(255),
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLA DE USUARIOS (Roles y permisos)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) DEFAULT 'consulta',
  nombre VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. TABLA PRINCIPAL DE MOVIMIENTOS
CREATE TABLE IF NOT EXISTS public.movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL, -- 'ingreso' o 'egreso'
  concepto VARCHAR(255) NOT NULL,
  moneda VARCHAR(50) DEFAULT 'ARS',
  monto DECIMAL(15, 2) NOT NULL,
  centro_costo UUID REFERENCES public.templos(id) ON DELETE SET NULL,
  caja UUID REFERENCES public.cajas(id) ON DELETE SET NULL,
  comprobante VARCHAR(100),
  beneficiario VARCHAR(255),
  observaciones TEXT,
  detalle_billetes JSONB, -- Para ofertas con desglose
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. TABLA DE SALDOS POR MONEDA
CREATE TABLE IF NOT EXISTS public.saldos_moneda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moneda VARCHAR(50) NOT NULL UNIQUE,
  saldo_inicial DECIMAL(15, 2) DEFAULT 0,
  saldo_actual DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla_afectada VARCHAR(100),
  id_registro UUID,
  tipo_operacion VARCHAR(50), -- INSERT, UPDATE, DELETE
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id UUID REFERENCES public.usuarios(id),
  fecha TIMESTAMP DEFAULT NOW()
);

-- 7. TABLA DE REVISORES DE CUENTA
CREATE TABLE IF NOT EXISTS public.revisores_cuenta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE UNIQUE,
  fecha_asignacion TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE,
  permiso_auditar BOOLEAN DEFAULT TRUE,
  permiso_certificar BOOLEAN DEFAULT FALSE
);

-- ============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX idx_movimientos_fecha ON public.movimientos(fecha DESC);
CREATE INDEX idx_movimientos_tipo ON public.movimientos(tipo);
CREATE INDEX idx_movimientos_concepto ON public.movimientos(concepto);
CREATE INDEX idx_movimientos_moneda ON public.movimientos(moneda);
CREATE INDEX idx_movimientos_usuario ON public.movimientos(usuario_id);
CREATE INDEX idx_auditoria_fecha ON public.auditoria(fecha DESC);
CREATE INDEX idx_auditoria_tabla ON public.auditoria(tabla_afectada);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas para MOVIMIENTOS
CREATE POLICY "Usuarios pueden ver sus propios movimientos" 
  ON public.movimientos FOR SELECT 
  USING (usuario_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.usuarios WHERE rol IN ('admin', 'auditor')));

CREATE POLICY "Cobradores pueden insertar movimientos" 
  ON public.movimientos FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT id FROM public.usuarios WHERE rol IN ('admin', 'cobrador')) AND usuario_id = auth.uid());

CREATE POLICY "Admins pueden actualizar movimientos" 
  ON public.movimientos FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM public.usuarios WHERE rol = 'admin'));

-- Políticas para TEMPLOS
CREATE POLICY "Todos pueden ver templos" 
  ON public.templos FOR SELECT 
  USING (TRUE);

CREATE POLICY "Solo admins pueden modificar templos" 
  ON public.templos FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.usuarios WHERE rol = 'admin'));

-- Políticas para CAJAS
CREATE POLICY "Todos pueden ver cajas" 
  ON public.cajas FOR SELECT 
  USING (TRUE);

CREATE POLICY "Solo admins pueden modificar cajas" 
  ON public.cajas FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.usuarios WHERE rol = 'admin'));

-- Políticas para USUARIOS
CREATE POLICY "Usuarios pueden ver su propio perfil" 
  ON public.usuarios FOR SELECT 
  USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM public.usuarios WHERE rol = 'admin'));

-- Políticas para AUDITORÍA
CREATE POLICY "Auditores y admins pueden ver auditoría" 
  ON public.auditoria FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.usuarios WHERE rol IN ('admin', 'auditor')));

-- ============================================
-- FUNCIÓN PARA REGISTRAR CAMBIOS EN AUDITORÍA
-- ============================================

CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.auditoria 
    (tabla_afectada, id_registro, tipo_operacion, datos_anteriores, datos_nuevos, usuario_id)
  VALUES 
    (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en MOVIMIENTOS
CREATE TRIGGER trigger_auditoria_movimientos
AFTER INSERT OR UPDATE OR DELETE ON public.movimientos
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar monedas iniciales
INSERT INTO public.saldos_moneda (moneda, saldo_inicial, saldo_actual)
VALUES 
  ('ARS', 0, 0),
  ('USD', 0, 0),
  ('CLP', 0, 0),
  ('PLAZO FIJO', 0, 0),
  ('BILLETERA ELECTRÓNICA', 0, 0)
ON CONFLICT (moneda) DO NOTHING;
