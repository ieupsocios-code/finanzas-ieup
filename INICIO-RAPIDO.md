# ⚡ INICIO RÁPIDO - 15 MINUTOS

## Para usuarios con prisa 😄

---

## 1️⃣ SUPABASE SETUP (5 min)

```bash
# Ve a https://supabase.com
# → Sign up → GitHub
# → New Project (finanzas-ieup, sa-east-1 region)
# → SQL Editor → Copy supabase-schema.sql → RUN
# → Settings → API → Copia URL y anon key
```

---

## 2️⃣ LOCAL DEVELOPMENT (5 min)

```bash
# En PowerShell (como Admin)
cd C:\tu-carpeta\finanzas-ieup

# Opción A: Instalación automática
.\install-windows.ps1

# Opción B: Manual
npm install
# Crea .env.local con tus credenciales
npm run dev
# Abre http://localhost:3000
```

---

## 3️⃣ PRIMER LOGIN (2 min)

```sql
-- En Supabase SQL Editor, ejecuta:
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@ieup.com', crypt('Admin@123', gen_salt('bf')), NOW());

INSERT INTO public.usuarios (email, rol)
VALUES ('admin@ieup.com', 'admin');
```

Inicia sesión con:
- Email: `admin@ieup.com`
- Password: `Admin@123`

---

## 4️⃣ DEPLOY A NETLIFY (3 min)

```bash
# En GitHub Desktop
# → Publish repository (finanzas-ieup, Privado)

# En Netlify
# → Import from GitHub → finanzas-ieup
# → Build: npm run build
# → Publish: dist
# → Agregar env vars (VITE_SUPABASE_URL y VITE_SUPABASE_KEY)
```

---

## ✨ LISTO

Tu app está en vivo en:
```
https://nombre-aleatorio.netlify.app
```

---

## 📚 Documentación Completa

- **INSTRUCCIONES-WINDOWS.md** - Guía detallada paso a paso
- **README.md** - Documentación completa
- **supabase-schema.sql** - Schema de la base de datos

---

## 🆘 Si algo falla

1. Revisa la consola (F12 en navegador)
2. Revisa PowerShell (errores rojos)
3. Verifica `.env.local` con credenciales correctas
4. Reinicia: `npm run dev`

¡Listo! 🚀
