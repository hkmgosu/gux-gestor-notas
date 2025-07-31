# Authentication Test Guide - Laravel Backend

## Current Configuration

The frontend is now configured to connect to your Laravel backend running on `localhost:8000`.

### API Endpoints Being Called:

- **Login:** `POST http://localhost:8000/api/login`
- **Register:** `POST http://localhost:8000/api/register`
- **Notes:** `GET http://localhost:8000/api/notes`
- **Create Note:** `POST http://localhost:8000/api/notes`
- **Update Note:** `PUT http://localhost:8000/api/notes/{id}`
- **Delete Note:** `DELETE http://localhost:8000/api/notes/{id}`
- **Shared Notes:** `GET http://localhost:8000/api/notes/shared`
- **Share Note:** `POST http://localhost:8000/api/notes/{id}/share`

### Admin User
- **Email:** `admin@domain.com`
- **Password:** `admin123`
- **Role:** Admin (can see all notes)

### Regular Users
- **Email:** `user@example.com`
- **Password:** `user123`
- **Role:** User

- **Email:** `test@test.com`
- **Password:** `test123`
- **Role:** User

## How Authentication Works Now

### Login Process:
1. User enters email and password
2. Frontend sends POST request to `/api/login`
3. Backend validates credentials against mock user database
4. If valid: returns JWT token and user data
5. If invalid: returns 401 error with message "Invalid email or password"

### Registration Process:
1. User enters email and password
2. Frontend sends POST request to `/api/register`
3. Backend checks if email already exists
4. If exists: returns 409 error with message "User already exists with this email"
5. If new: creates user and returns JWT token and user data

### Error Handling:
- Invalid credentials show specific error messages
- Network errors show fallback error messages
- Registration conflicts are properly handled

## Testing Instructions

1. **Test Valid Login:**
   - Go to `/login`
   - Use any of the test accounts above
   - Should redirect to `/notes` page

2. **Test Invalid Login:**
   - Go to `/login`
   - Use incorrect email/password
   - Should show "Invalid email or password"

3. **Test Registration:**
   - Go to `/register`
   - Use a new email address
   - Should create account and redirect to `/notes`

4. **Test Duplicate Registration:**
   - Go to `/register`
   - Use an existing email (like `admin@domain.com`)
   - Should show "User already exists with this email"

## Production Notes

When connecting to your Laravel backend:
- Replace the mock user database with actual API calls
- Update endpoints to point to your Laravel backend URLs
- Implement proper JWT token validation
- Add password hashing/verification
- Add proper error handling for network issues
