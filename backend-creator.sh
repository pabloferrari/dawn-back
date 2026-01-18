#!/bin/bash

# Crear proyecto
nest new backend
cd backend

# Instalar dependencias
npm install puppeteer handlebars pdf-lib sharp dayjs @nestjs/jwt

# Crear módulos con CLI
nest g module modules/pdf-generator
nest g service modules/pdf-generator/pdf-generator --no-spec

nest g module modules/templates
nest g service modules/templates/template --no-spec

nest g module modules/auth
nest g service modules/auth/auth --no-spec
nest g controller modules/auth/auth --no-spec
nest g guard modules/auth/jwt-auth --no-spec

nest g module modules/products/budget-planner
nest g service modules/products/budget-planner/budget-planner --no-spec
nest g controller modules/products/budget-planner/budget-planner --no-spec

nest g module modules/products/baby-sign
nest g service modules/products/baby-sign/baby-sign --no-spec
nest g controller modules/products/baby-sign/baby-sign --no-spec

# Crear carpetas manuales
mkdir -p src/common/interfaces
mkdir -p src/modules/products/budget-planner/interfaces
mkdir -p src/modules/products/baby-sign/interfaces
mkdir -p templates/budget-planner
mkdir -p templates/baby-sign

# Crear archivos de interfaces
touch src/common/interfaces/product-config.interface.ts
touch src/modules/products/budget-planner/interfaces/budget-planner-config.interface.ts
touch src/modules/products/baby-sign/interfaces/baby-sign-config.interface.ts

# Crear templates
touch templates/budget-planner/cover.hbs
touch templates/budget-planner/monthly-budget.hbs
touch templates/budget-planner/expense-tracker.hbs
touch templates/budget-planner/savings-goal.hbs
touch templates/budget-planner/yearly-overview.hbs

touch templates/baby-sign/cover.hbs
touch templates/baby-sign/intro-why.hbs
touch templates/baby-sign/intro-when.hbs
touch templates/baby-sign/intro-tips.hbs
touch templates/baby-sign/category-index.hbs
touch templates/baby-sign/category-divider.hbs
touch templates/baby-sign/sign-page.hbs
touch templates/baby-sign/practice-log.hbs

echo "✅ Estructura creada. Ahora copia el contenido a cada archivo."