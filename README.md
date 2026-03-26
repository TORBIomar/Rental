# Rental Project

Full-stack rental platform with:
- `FrontendRental`: React + Vite client
- `BackendRental`: Django backend

## Project structure

- `FrontendRental/` - user interface and admin pages
- `BackendRental/` - API, models, and backend logic

## Quick start

### Frontend
1. Go to `FrontendRental`
2. Install dependencies: `npm install`
3. Create `FrontendRental/.env` from root `.env.example`
4. Start dev server: `npm run dev`

### Backend
1. Go to `BackendRental`
2. Create/activate virtual environment
3. Install dependencies
4. Run migrations and start server

## Environment

Use root `.env.example` as the base template for required public client variables.

## Notes

- Sensitive files and local artifacts are ignored by root `.gitignore`.
- Generated contracts/uploads are not tracked in git.
