# 🚀 Guía de Deployment en Vercel

## ✅ Checklist Pre-Deployment

### 1. Variables de Entorno Requeridas

**IMPORTANTE**: Configura estas variables en Vercel **ANTES** de hacer deploy:

#### Database (Hostinger MySQL)
```bash
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@HOST:3306/NOMBRE_DB"
```

Formato completo:
```bash
DATABASE_URL="mysql://u253625720_myanim:TU_CONTRASEÑA@srv812.hstgr.io:3306/u253625720_myanim"
```

#### NextAuth.js
```bash
NEXTAUTH_SECRET="genera-un-secreto-aleatorio-seguro-aqui"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
```

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```
O usa: https://generate-secret.vercel.app/32

#### Node Environment
```bash
NODE_ENV="production"
```

---

## 📋 Pasos para Deploy en Vercel

### Opción A: Deploy desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Animeka production ready"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/animeka.git
   git push -u origin main
   ```

2. **Conecta con Vercel**:
   - Ve a https://vercel.com/new
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es Next.js

3. **Configura Variables de Entorno**:
   - En el dashboard de Vercel, ve a "Settings" → "Environment Variables"
   - Añade las 3 variables requeridas arriba
   - Aplica a: Production, Preview, Development

4. **Deploy**:
   - Click en "Deploy"
   - Espera 2-3 minutos
   - ¡Listo! 🎉

### Opción B: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (primera vez)
vercel

# Configurar variables de entorno
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Deploy a producción
vercel --prod
```

---

## ⚙️ Configuración de Prisma en Vercel

### Build Command (Automático)
Vercel usará: `npm run build`

### Asegurar que Prisma genera el cliente:

En `package.json`, verifica que exista:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

---

## 🔒 Seguridad - Verificación Final

### ❌ NO Subas a GitHub:
- [x] `.env` - ✅ Ya está en .gitignore
- [x] `.env.local` - ✅ Ya está en .gitignore
- [x] `node_modules/` - ✅ Ya está en .gitignore
- [x] `.next/` - ✅ Ya está en .gitignore
- [x] Credenciales de base de datos - ✅ No hay en código

### ✅ SÍ Sube a GitHub:
- [x] Todo el código fuente
- [x] `prisma/schema.prisma` (sin credenciales)
- [x] `.env.example` (sin valores reales)
- [x] `package.json` y `package-lock.json`

---

## 🗄️ Conexión a Base de Datos

### Hostinger MySQL Configuration

**Verificar que tu base de datos Hostinger permita conexiones externas:**

1. En tu panel de Hostinger, ve a "Bases de Datos MySQL"
2. Busca "Acceso Remoto" o "Remote MySQL"
3. Añade la IP de Vercel (o permite todas: `%` - solo para testing)

**Nota**: Vercel usa IPs dinámicas, considera:
- Usar `%` para permitir todas las IPs (menos seguro pero funcional)
- O migrar a una base de datos serverless como PlanetScale o Neon

### Alternativa Recomendada: PlanetScale (Gratis)

Si tienes problemas con Hostinger desde Vercel:

```bash
# 1. Crea cuenta en https://planetscale.com
# 2. Crea nueva database
# 3. Obtén connection string
# 4. Actualiza DATABASE_URL en Vercel
# 5. Push schema: npx prisma db push
```

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"
**Solución**: 
- Verifica que Hostinger permita conexiones remotas
- Confirma que DATABASE_URL esté correctamente configurado
- Considera usar PlanetScale

### Error: "NEXTAUTH_URL missing"
**Solución**: 
- Añade variable de entorno en Vercel
- Valor: `https://tu-app.vercel.app`

### Error: "Prisma Client not initialized"
**Solución**: 
- Verifica que `postinstall` script ejecute `prisma generate`
- Rebuild en Vercel

### Error: "Module not found"
**Solución**: 
- Limpia cache: `npm run clean` (si existe)
- Borra `.next` y `node_modules` localmente
- Push de nuevo

---

## 📊 Monitoreo Post-Deploy

### Vercel Dashboard
- **Logs**: Ver errores en tiempo real
- **Analytics**: Tráfico y performance
- **Deployments**: Historial de deploys

### Verificar que funciona:
1. ✅ Página principal carga
2. ✅ Registro de usuario funciona
3. ✅ Login funciona
4. ✅ Búsqueda de anime funciona
5. ✅ Recomendaciones funcionan

---

## 🌐 Dominio Personalizado (Opcional)

1. Ve a Vercel Dashboard → Settings → Domains
2. Añade tu dominio (ej: `animeka.com`)
3. Configura DNS según instrucciones de Vercel
4. Actualiza `NEXTAUTH_URL` a tu nuevo dominio

---

## 📈 Optimizaciones Post-Deploy

### Edge Functions (Vercel)
Tu middleware ya está optimizado para Vercel Edge.

### ISR (Incremental Static Regeneration)
Ya configurado en páginas de anime.

### Image Optimization
Ya configurado en `next.config.ts`.

---

## 🆘 Soporte

Si encuentras problemas:

1. **Vercel Logs**: https://vercel.com/docs/concepts/deployments/logs
2. **Prisma Docs**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
3. **Next.js Vercel**: https://nextjs.org/learn/basics/deploying-nextjs-app/deploy

---

## ✨ ¡Todo Listo!

Tu aplicación está preparada para producción con:
- ✅ Seguridad robusta
- ✅ Rate limiting activo
- ✅ Optimizaciones de performance
- ✅ Error boundaries
- ✅ Logging centralizado

**¡Haz deploy con confianza! 🚀**

---

**Última actualización**: ${new Date().toLocaleDateString('es-ES')}

