# 🚀 GUÍA COMPLETA: INSTALAR Y DEPLOYAR FINANZAS IEUP EN WINDOWS

**Para:** Daniel Gomez (ieupnet@gmail.com)
**Sistema Operativo:** Windows 11/10
**Duración:** 30-45 minutos

---

## ✅ PASO 1: PREPARAR SUPABASE (5 minutos)

### 1.1 Crear cuenta y proyecto

1. Ve a **https://supabase.com**
2. Clic en **"Start your project"**
3. Haz clic en **"Sign in with GitHub"**
4. Usa tu cuenta GitHub `ieupnet-ux`
5. Autoriza Supabase
6. Clic en **"New Project"**
7. Rellena:
   - **Project name:** `finanzas-ieup`
   - **Database password:** Ej: `Ieup@2024Seg$` (guarda en un lugar seguro)
   - **Region:** `South America (sa-east-1)` ← Para Argentina
8. Clic en **"Create new project"**
9. ⏳ Espera 2-3 minutos a que se cree

### 1.2 Ejecutar el schema SQL

1. Cuando esté listo, ve a **SQL Editor** (panel izquierdo)
2. Clic en **"+ New Query"**
3. **Abre el archivo `supabase-schema.sql`** con el Bloc de Notas
4. Copia TODO el contenido (Ctrl+A, Ctrl+C)
5. Pégalo en Supabase (Ctrl+V)
6. Clic en botón azul **"RUN"** (arriba a la derecha)
7. ✅ Deberías ver: "Query executed successfully"

### 1.3 Obtener las credenciales

1. En Supabase, clic en **Settings** (abajo izquierda)
2. Ve a **API** (en el menú)
3. Copia estos valores:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **anon public key** (es una llave larga de texto)
4. **Pégalos en un Bloc de Notas** para usar después

---

## 💻 PASO 2: INSTALAR EN WINDOWS (10 minutos)

### 2.1 Descargar e instalar Node.js

1. Ve a **https://nodejs.org**
2. Descarga la versión **LTS** (Long Term Support)
3. Abre el instalador `.exe`
4. Siguiente, siguiente, siguiente... ✅ Instala
5. ⚠️ **IMPORTANTE:** Al terminar, **reinicia Windows**

### 2.2 Verificar la instalación

1. Abre **PowerShell** (busca en Windows)
2. Escribe este comando y presiona Enter:
   ```powershell
   node --version
   ```
3. Deberías ver algo como: `v18.17.0` ✅
4. Escribe:
   ```powershell
   npm --version
   ```
5. Deberías ver algo como: `9.6.7` ✅

### 2.3 Descargar los archivos del proyecto

**Opción A - Con GitHub Desktop (Fácil):**

1. Descarga GitHub Desktop: https://desktop.github.com
2. Abre GitHub Desktop
3. Clic en **File** → **Clone repository**
4. Busca: `ieupnet-ux/finanzas-ieup`
5. Elige dónde guardar (ej: `C:\Proyectos`)
6. Clic en **Clone**

**Opción B - Descargar como ZIP:**

1. Ve a https://github.com/ieupnet-ux/finanzas-ieup
2. Clic en **Code** → **Download ZIP**
3. Extrae el ZIP a `C:\Proyectos\finanzas-ieup`

### 2.4 Instalar dependencias

1. Abre **PowerShell** como **Administrador**
   - Haz clic derecho en PowerShell → "Run as administrator"
2. Navega a la carpeta:
   ```powershell
   cd C:\Proyectos\finanzas-ieup
   ```
   (Ajusta la ruta si guardaste en otro lugar)

3. Instala las dependencias:
   ```powershell
   npm install
   ```
   ⏳ Esto tardará 2-5 minutos. Verás muchas líneas de texto.

4. Cuando termine, verás: `added XX packages`

---

## 🔑 PASO 3: CONFIGURAR CREDENCIALES (2 minutos)

### 3.1 Crear archivo .env.local

1. Abre **Bloc de Notas**
2. Copia esto:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_KEY=tu-anon-key-aqui
   ```

3. **Reemplaza los valores con los que copiaste de Supabase en el PASO 1.3**
   - Ejemplo real sería algo como:
   ```
   VITE_SUPABASE_URL=https://abcdefgh123456.supabase.co
   VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Guarda el archivo como **`.env.local`** en la carpeta `C:\Proyectos\finanzas-ieup`
   - Archivo → Guardar como
   - Nombre: `.env.local`
   - Tipo: Todos los archivos
   - Ubicación: `C:\Proyectos\finanzas-ieup`

---

## 🧪 PASO 4: PROBAR LOCALMENTE (5 minutos)

### 4.1 Iniciar servidor de desarrollo

1. En **PowerShell** (en la carpeta del proyecto):
   ```powershell
   npm run dev
   ```

2. Espera a ver:
   ```
   ➜  Local:   http://localhost:3000/
   ```

3. Abre tu navegador (Chrome, Edge, Firefox) en:
   ```
   http://localhost:3000
   ```

4. Deberías ver la **pantalla de login con el logo de IEUP** 🎉

### 4.2 Crear primer usuario (Admin)

1. En Supabase, ve a **Authentication** → **Users**
2. Clic en **"+ Add user"**
3. Email: `admin@ieup.com`
4. Password: Ej: `Admin@123`
5. Clic en **"Create user"**
6. Vuelve a http://localhost:3000
7. Inicia sesión con:
   - Email: `admin@ieup.com`
   - Password: `Admin@123`
8. ¡Deberías entrar al Dashboard! 🎉

---

## 📤 PASO 5: DEPLOYAR EN NETLIFY (15 minutos)

### 5.1 Subir a GitHub

1. Abre **GitHub Desktop**
2. En la pestaña **Changes**, deberías ver todos los archivos
3. En **Summary**, escribe: `Inicial: Sistema de finanzas IEUP`
4. Clic en **"Commit to main"**
5. Clic en **"Publish repository"**
6. Asegúrate de que esté **Privado**
7. Clic en **"Publish Repository"**

### 5.2 Conectar a Netlify

1. Ve a **https://netlify.com**
2. Clic en **"Sign up"**
3. Clic en **"GitHub"**
4. Autoriza Netlify
5. Clic en **"Add new site"** → **"Import an existing project"**
6. Conecta con GitHub
7. Busca y selecciona: `finanzas-ieup`
8. En la siguiente pantalla:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
9. Clic en **"Deploy site"**

### 5.3 Agregar variables de entorno

1. En Netlify, ve a **Site settings** (arriba)
2. En el menú izquierdo: **Build & deploy** → **Environment**
3. Clic en **"Edit variables"**
4. Agrega dos variables:
   - **Key:** `VITE_SUPABASE_URL` | **Value:** (tu URL de Supabase)
   - **Key:** `VITE_SUPABASE_KEY` | **Value:** (tu anon key de Supabase)
5. Guarda

### 5.4 Redeploy

1. Ve a **Deployments**
2. Clic en el deploy más reciente
3. Clic en **"Trigger deploy"** → **"Deploy site"**
4. Espera 2-3 minutos
5. ¡Cuando diga "Published", tu app está en vivo! 🚀

**Tu URL será algo como:** `https://nombre-aleatorio-123.netlify.app`

---

## 📱 PASO 6: INSTALAR EN MÓVIL (2 minutos)

### Android
1. Abre Chrome
2. Ve a tu URL de Netlify
3. Toca el menú (⋮ en la esquina)
4. **"Instalar aplicación"**
5. ¡Listo! Aparecerá en tu pantalla de inicio

### iPhone/iPad
1. Abre Safari
2. Ve a tu URL
3. Toca el botón **Compartir**
4. **"Añadir a la pantalla de inicio"**
5. ¡Listo! Aparecerá en tu pantalla de inicio

---

## 🔧 COMANDOS ÚTILES

```powershell
# Iniciar desarrollo
npm run dev

# Build para production
npm run build

# Ver qué pasará en build (sin hacer cambios)
npm run preview

# Limpiar cache de npm
npm cache clean --force
```

---

## ⚠️ PROBLEMAS COMUNES (Windows)

### "El archivo .env.local no se ve"
- Es normal, Windows oculta archivos que empiezan con punto
- Ve a la carpeta, clic derecho → **Ver** → **Mostrar archivos ocultos**

### Error: "npm: La secuencia de comandos no puede ejecutarse"
- Abre PowerShell **como Administrador**
- Ejecuta: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`
- Escribe `Y` y Enter

### "Cannot find module '@supabase/supabase-js'"
- La carpeta `node_modules` no se copió bien
- Elimina la carpeta `node_modules`
- Ejecuta: `npm install` nuevamente

### Los cambios locales no se ven
- Guarda el archivo (Ctrl+S)
- El navegador se refresca automáticamente
- Si no, presiona Ctrl+Shift+R (refresco duro)

### "VITE_SUPABASE_URL is undefined"
- Verifica que `.env.local` existe en la raíz del proyecto
- Verifica que las variables están correctas
- Reinicia: Ctrl+C en PowerShell y `npm run dev` nuevamente

---

## 📊 PRÓXIMOS PASOS

1. ✅ Crea más templos (Settings → Templos)
2. ✅ Crea cajas por tipo (Settings → Cajas)
3. ✅ Crea usuarios para cobradores
4. ✅ Comienza a registrar ingresos y egresos
5. ✅ Genera reportes

---

## 💾 BACKUP Y SEGURIDAD

### Hacer backup de datos

**En Supabase:**
1. Ve a **Backups**
2. Haz clic en **"Backup now"**
3. Los datos se guardan automáticamente

**En GitHub:**
- Tu código está seguro en GitHub
- El push automático se hace cada vez que cambias

---

## 📞 SOPORTE RÁPIDO

Si algo no funciona:

1. **Revisa la consola:**
   - F12 en el navegador
   - Ve a **Console**
   - ¿Hay errores rojos? Cópialo

2. **Revisa PowerShell:**
   - ¿Hay errores en rojo? Cópialo

3. **Contacta con soporte:**
   - Ve a https://github.com/ieupnet-ux/finanzas-ieup
   - Abre un **Issue**
   - Describe el problema y pega los errores

---

## 🎉 ¡LISTO!

Tu sistema de finanzas está instalado y funcionando.

**Próximas cosas:**
- ✏️ Registra tus primeros movimientos
- 📈 Crea gráficos y reportes
- 👥 Invita a otros usuarios
- 📱 Instala en móviles

---

**Versión:** 1.0.0
**Última actualización:** 2024
**Para:** Iglesia Evangélica Unión Pentecostal

¡Que Dios bendiga el ministerio de finanzas! 🙏
