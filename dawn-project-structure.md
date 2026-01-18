# Dawn - Estructura Completa del Proyecto

## Estructura General

```
dawn/
├── backend/
│   ├── src/
│   ├── templates/
│   ├── output/
│   ├── node_modules/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
└── frontend/
    ├── src/
    ├── public/
    ├── node_modules/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── index.html
```

---

## Backend - Estructura Detallada

```
backend/
├── src/
│   ├── common/
│   │   └── interfaces/
│   │       └── product-config.interface.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── jwt-auth.guard.ts
│   │   │
│   │   ├── pdf-generator/
│   │   │   ├── pdf-generator.service.ts
│   │   │   └── pdf-generator.module.ts
│   │   │
│   │   ├── templates/
│   │   │   ├── template.service.ts
│   │   │   └── template.module.ts
│   │   │
│   │   └── products/
│   │       ├── budget-planner/
│   │       │   ├── interfaces/
│   │       │   │   └── budget-planner-config.interface.ts
│   │       │   ├── budget-planner.controller.ts
│   │       │   ├── budget-planner.service.ts
│   │       │   └── budget-planner.module.ts
│   │       │
│   │       └── baby-sign/
│   │           ├── interfaces/
│   │           │   └── baby-sign-config.interface.ts
│   │           ├── baby-sign.controller.ts
│   │           ├── baby-sign.service.ts
│   │           └── baby-sign.module.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── templates/
│   ├── budget-planner/
│   │   ├── cover.hbs
│   │   ├── monthly-budget.hbs
│   │   ├── expense-tracker.hbs
│   │   ├── savings-goal.hbs
│   │   └── yearly-overview.hbs
│   │
│   └── baby-sign/
│       ├── cover.hbs
│       ├── intro-why.hbs
│       ├── intro-when.hbs
│       ├── intro-tips.hbs
│       ├── category-index.hbs
│       ├── category-divider.hbs
│       ├── sign-page.hbs
│       └── practice-log.hbs
│
├── output/
│   ├── budget-planner/
│   │   └── (PDFs generados aquí)
│   └── baby-sign/
│       └── (PDFs generados aquí)
│
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
└── .gitignore
```

---

## Frontend - Estructura Detallada

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   └── ProductCard.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── BudgetPlannerForm.jsx
│   │   └── BabySignForm.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── assets/
│   │   └── react.svg
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── public/
│   └── vite.svg
│
├── node_modules/
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .gitignore
└── eslint.config.js
```

---

## Checklist de Archivos Críticos

### Backend

**✅ Configuración Base**
- [ ] `src/main.ts` - Con CORS habilitado
- [ ] `src/app.module.ts` - Importa AuthModule, BudgetPlannerModule, BabySignModule
- [ ] `package.json` - Con todas las dependencias (puppeteer, handlebars, pdf-lib, sharp, dayjs, @nestjs/jwt)

**✅ Auth Module**
- [ ] `src/modules/auth/auth.module.ts`
- [ ] `src/modules/auth/auth.service.ts`
- [ ] `src/modules/auth/auth.controller.ts`
- [ ] `src/modules/auth/jwt-auth.guard.ts`

**✅ PDF Generator Module**
- [ ] `src/modules/pdf-generator/pdf-generator.module.ts`
- [ ] `src/modules/pdf-generator/pdf-generator.service.ts`

**✅ Templates Module**
- [ ] `src/modules/templates/template.module.ts`
- [ ] `src/modules/templates/template.service.ts`

**✅ Budget Planner Module**
- [ ] `src/modules/products/budget-planner/budget-planner.module.ts`
- [ ] `src/modules/products/budget-planner/budget-planner.service.ts`
- [ ] `src/modules/products/budget-planner/budget-planner.controller.ts`
- [ ] `src/modules/products/budget-planner/interfaces/budget-planner-config.interface.ts`

**✅ Baby Sign Module**
- [ ] `src/modules/products/baby-sign/baby-sign.module.ts`
- [ ] `src/modules/products/baby-sign/baby-sign.service.ts`
- [ ] `src/modules/products/baby-sign/baby-sign.controller.ts`
- [ ] `src/modules/products/baby-sign/interfaces/baby-sign-config.interface.ts`

**✅ Interfaces Comunes**
- [ ] `src/common/interfaces/product-config.interface.ts`

**✅ Templates (Budget Planner)**
- [ ] `templates/budget-planner/cover.hbs`
- [ ] `templates/budget-planner/monthly-budget.hbs`
- [ ] `templates/budget-planner/expense-tracker.hbs`
- [ ] `templates/budget-planner/savings-goal.hbs`
- [ ] `templates/budget-planner/yearly-overview.hbs`

**✅ Templates (Baby Sign)**
- [ ] `templates/baby-sign/cover.hbs`
- [ ] `templates/baby-sign/intro-why.hbs`
- [ ] `templates/baby-sign/intro-when.hbs`
- [ ] `templates/baby-sign/intro-tips.hbs`
- [ ] `templates/baby-sign/category-index.hbs`
- [ ] `templates/baby-sign/category-divider.hbs`
- [ ] `templates/baby-sign/sign-page.hbs`
- [ ] `templates/baby-sign/practice-log.hbs`

### Frontend

**✅ Configuración**
- [ ] `vite.config.js` - Con proxy configurado
- [ ] `tailwind.config.js` - Con content paths correctos
- [ ] `postcss.config.js` - Generado por Tailwind
- [ ] `src/index.css` - Con @tailwind directives
- [ ] `package.json` - Con axios, react-router-dom

**✅ Servicios**
- [ ] `src/services/api.js` - Con authAPI, budgetPlannerAPI, babySignAPI

**✅ Componentes**
- [ ] `src/components/Login.jsx`
- [ ] `src/components/ProductCard.jsx`

**✅ Páginas**
- [ ] `src/pages/Dashboard.jsx`
- [ ] `src/pages/BudgetPlannerForm.jsx`
- [ ] `src/pages/BabySignForm.jsx`

**✅ App Principal**
- [ ] `src/App.jsx` - Con React Router y rutas configuradas
- [ ] `src/main.jsx` - (No modificar, viene por defecto)

---

## Dependencias Necesarias

### Backend (package.json)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "puppeteer": "^21.0.0",
    "handlebars": "^4.7.8",
    "pdf-lib": "^1.17.1",
    "sharp": "^0.33.0",
    "dayjs": "^1.11.10",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  }
}
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## Puertos y URLs

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`

---

## Comandos para Verificar Estructura

### Backend
```bash
cd backend
tree -I 'node_modules|dist' -L 4
```

### Frontend
```bash
cd frontend
tree -I 'node_modules|dist' -L 3
```

---

## Rutas del API (Backend)

```
POST   /auth/login
POST   /products/budget-planner/generate
GET    /products/budget-planner/default-config
POST   /products/baby-sign/generate
GET    /products/baby-sign/default-config
GET    /products/baby-sign/default-signs
```

---

## Rutas del Frontend

```
/login              → Login.jsx
/dashboard          → Dashboard.jsx (protegida)
/budget-planner     → BudgetPlannerForm.jsx (protegida)
/baby-sign          → BabySignForm.jsx (protegida)
/                   → Redirect a /dashboard
```

---

## Archivos que NO debes tener

❌ `frontend/src/App.css` - Debe eliminarse (usamos Tailwind)
❌ `backend/src/app.controller.ts` - No lo necesitamos
❌ `backend/src/app.service.ts` - No lo necesitamos

---

## Verificación Rápida

### Backend debe arrancar sin errores:
```bash
cd backend
npm run start:dev
```

Debes ver:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AuthModule dependencies initialized
[Nest] LOG [InstanceLoader] BudgetPlannerModule dependencies initialized
[Nest] LOG [InstanceLoader] BabySignModule dependencies initialized
🚀 Dawn API running on http://localhost:3000
```

### Frontend debe arrancar sin errores:
```bash
cd frontend
npm run dev
```

Debes ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Testing Rápido

1. **Login funciona:**
   - Ir a `http://localhost:5173/login`
   - Usuario: `admin`, Password: `dawn2026`
   - Debe redirigir a Dashboard

2. **Dashboard carga:**
   - Ver 2 tarjetas de productos + 1 placeholder
   - Click en "Budget Planner" debe ir a formulario

3. **Formularios cargan:**
   - Budget Planner form debe mostrar campos
   - Baby Sign form debe mostrar campos
   - Botón "Generate" debe estar visible

---

## Errores Comunes

### "Loading..." infinito en formularios

**Causa:** El `useEffect` no puede cargar la configuración por defecto

**Verificar:**
1. Backend está corriendo (`npm run start:dev`)
2. CORS está habilitado en `main.ts`
3. API endpoints existen:
   - `GET /products/budget-planner/default-config`
   - `GET /products/baby-sign/default-config`

**Debug en browser:**
```javascript
// Abrir Console (F12) y ejecutar:
fetch('http://localhost:3000/products/budget-planner/default-config')
  .then(r => r.json())
  .then(console.log)
```

### CORS Error

**Verificar en `backend/src/main.ts`:**
```typescript
app.enableCors();
```

### "Cannot find module"

**Backend:** Verificar imports en modules
**Frontend:** Verificar paths en imports (deben ser relativos correctos)

---

## Siguiente Paso: Debug

Una vez que compares tu estructura con esta, si el problema persiste:

1. Abre DevTools (F12) en el navegador
2. Ve a la pestaña Network
3. Intenta cargar el formulario
4. Verifica qué request falla
5. Comparte el error exacto
