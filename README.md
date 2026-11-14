# FinanceFlow — Sistema de Gestión Financiera

FinanceFlow es una aplicación web full stack desarrollada para registrar, administrar y visualizar ingresos y gastos personales.

## Funcionalidades

- Registro de ingresos y gastos.
- Edición y eliminación de transacciones.
- Visualización del balance financiero.
- Gráficos y estadísticas.
- Filtrado de movimientos.
- Almacenamiento persistente en PostgreSQL.

## Tecnologías utilizadas

**Frontend**
- React
- JavaScript
- HTML5
- CSS3
- Vite
- Recharts

**Backend**
- Node.js
- Express
- API REST

**Base de datos**
- PostgreSQL
- pgAdmin 4

## Estructura del proyecto

```text
FinanceFlow/
├── frontend/
├── backend/
└── README.md
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/FinanceFlow.git
cd FinanceFlow
```

### 2. Configurar PostgreSQL

Crear una base de datos llamada `portafolio_react` y ejecutar el archivo `backend/schema.sql`.

### 3. Configurar el backend

Crear un archivo `.env` dentro de `backend` utilizando `.env.example` como referencia.

```env
DATABASE_URL=postgresql://postgres:TU_CONTRASENA@localhost:5432/portafolio_react
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

### 4. Ejecutar el backend

```bash
cd backend
npm install
npm run dev
```

### 5. Ejecutar el frontend

Desde otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

## Objetivo

Este proyecto fue desarrollado como parte de mi portafolio profesional para demostrar conocimientos de React, JavaScript, desarrollo de APIs REST y bases de datos relacionales.

## Estado

Proyecto funcional en entorno de desarrollo local.