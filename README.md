# DriveFlow

DriveFlow is a full-stack car rental and sales platform built with React + Vite on the frontend and Django REST API on the backend.
It includes customer flows (browse, reserve, pay) and admin flows (vehicle and user management).

## Why this project

This project solves the core needs of a modern vehicle business:
- manage a catalog of cars for **rental** and **sale**
- handle customer reservations and purchases
- process online checkout with Stripe
- provide basic admin tools for operations

## Core features

- Authentication with JWT (register/login)
- Vehicle catalog with detailed car information
- Rental and purchase workflows
- Stripe checkout session creation
- Contract file support for sales/rentals
- Admin pages for users, vehicles, rentals, and sales
- User-specific history (`mes-ventes`, `mes-locations`)

## Tech stack

### Frontend (`FrontendRental`)
- React 19
- Vite 6
- React Router
- Axios
- Stripe JS / React Stripe
- Firebase (configured in client)

### Backend (`BackendRental`)
- Django 5
- Django REST Framework
- SimpleJWT for token auth
- MySQL database
- Stripe Python SDK

## Project structure

```text
Rental/
|-- FrontendRental/        # React app
|   |-- src/
|   |-- public/
|   `-- package.json
|-- BackendRental/         # Django API + business logic
|   |-- Rental/            # project settings and root urls
|   |-- app/               # models, serializers, views, routes
|   |-- media/             # local uploads (ignored for contracts)
|   `-- manage.py
|-- .env.example
|-- .gitignore
`-- README.md
```

## API overview

Base URL (local): `http://127.0.0.1:8000/api/`

Main endpoints:
- `POST /api/register/`
- `POST /api/login/`
- `GET /api/voitures/`
- `GET/POST /api/ventes/`
- `GET/POST /api/locations/`
- `GET /api/mes-ventes/`
- `GET /api/mes-locations/`
- `POST /api/stripe-checkout/`
- `GET /api/users/`
- `DELETE /api/users/delete/<user_id>/`

## Frontend routes (examples)

- `/` home
- `/buy`, `/buycar/:id`
- `/rent`, `/rentcar/:id`
- `/payment/:id`, `/paiement-reussi`, `/paymentcancel`
- `/admin`, `/client`
- `/gestionutilisateurs`, `/gestionvoitures`, `/gestionlocations`, `/gestionventes`

## Local development setup

## 1) Clone

```bash
git clone https://github.com/TORBIomar/Rental.git
cd Rental
```

## 2) Frontend setup

```bash
cd FrontendRental
npm install
```

Create `FrontendRental/.env` from root `.env.example`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
```

Run frontend:

```bash
npm run dev
```

Default frontend URL: `http://localhost:5173`

## 3) Backend setup

From repo root:

```bash
cd BackendRental
python -m venv .venv
```

Activate venv:
- Windows (PowerShell): `.venv\Scripts\Activate.ps1`
- macOS/Linux: `source .venv/bin/activate`

Install backend dependencies (manual, since dependency file is not yet committed):

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pymysql stripe pillow
```

Configure database in `BackendRental/Rental/settings.py` for your MySQL instance, then run:

```bash
python manage.py migrate
python manage.py runserver
```

Default backend URL: `http://127.0.0.1:8000`

## Security notes

- Never commit real secrets (`.env`, API keys, credentials).
- Move sensitive settings (Django secret key, DB credentials, Stripe secret key) to environment variables before production.
- Rotate any test keys that were previously committed.

## Production recommendations

- Set `DEBUG=False` and configure `ALLOWED_HOSTS`.
- Use HTTPS and secure cookies.
- Add CI checks (lint/test/build).
- Add proper role-based permission checks for admin endpoints.
- Store media in cloud storage (S3, Cloudinary, etc.) instead of local disk.

## Suggested repository name

**DriveFlow** (recommended)  
Alternative options:
- **AutoLeaseHub**
- **Rentora**
- **Carvia Platform**
- **FleetNest**
