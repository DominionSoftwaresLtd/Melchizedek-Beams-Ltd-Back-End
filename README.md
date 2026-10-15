# Melchizedek Beams Ltd — Backend API

## Quick Start

```bash
npm install
npm run dev       # development with nodemon
npm run seed      # seed database with sample data + admin user
npm start         # production
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiry e.g. `30d` |
| `PORT` | Server port (default 5000) |

## Testing Credentials

> **For development and testing only. Change before deploying to production.**

| Role | Email | Password |
|---|---|---|
| Admin | `info@melchizedekbeams.org` | `MelchizedekBeams` |

Run `npm run seed` to create these accounts automatically.

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login (admin or student) |
| POST | `/api/auth/register` | Register (admin use) |
| GET | `/api/auth/me` | Get current user |

### Registrations / Enrollment
| Method | Route | Description |
|---|---|---|
| GET | `/api/registrations` | List all registrations (admin) |
| POST | `/api/registrations` | Submit enrollment application |
| PATCH | `/api/registrations/:id/approve` | Approve + create student account |
| PATCH | `/api/registrations/:id/reject` | Reject an enrollment |

### Students (Enrolled Users)
| Method | Route | Description |
|---|---|---|
| GET | `/api/students/me` | Get own profile + progress |
| GET | `/api/students/:id/progress` | Get progress (admin) |
| PATCH | `/api/students/:id/progress` | Update progress (admin) |
| GET | `/api/students/:id/certificate` | Download certificate (PDF) |

### Programmes
| Method | Route | Description |
|---|---|---|
| GET | `/api/programmes` | List all programmes |
| POST | `/api/programmes` | Create programme (admin) |
| PUT | `/api/programmes/:id` | Update programme (admin) |
| DELETE | `/api/programmes/:id` | Delete programme (admin) |

### Gallery
| Method | Route | Description |
|---|---|---|
| GET | `/api/gallery` | List gallery items |
| POST | `/api/gallery` | Upload gallery image (admin) |
| DELETE | `/api/gallery/:id` | Delete gallery item (admin) |

### Resources
| Method | Route | Description |
|---|---|---|
| GET | `/api/resources` | List resources |
| POST | `/api/resources` | Add resource (admin) |
| DELETE | `/api/resources/:id` | Remove resource (admin) |

## Architecture Notes

- ESM modules (`"type": "module"`)
- JWT auth — token stored in `Authorization: Bearer <token>` header
- Student accounts are created **by the admin** when approving an enrollment (auto-generated password emailed to student)
- Progress is tracked as an array of completed module IDs on the User document
- Certificates are generated server-side when a student completes all modules
