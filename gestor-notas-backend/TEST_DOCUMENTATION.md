# 🧪 Testing Documentation

## Overview
This Laravel application includes comprehensive tests for authentication and note management functionality.

## Test Structure

### 📁 Test Organization
```
tests/
├── Feature/
│   ├── AuthTest.php          # Authentication endpoints testing
│   ├── NoteTest.php          # Note management API testing
│   └── ExampleTest.php       # Basic application test
├── Unit/
│   ├── UserModelTest.php     # User model testing
│   ├── NoteModelTest.php     # Note model testing
│   └── ExampleTest.php       # Basic unit test
├── TestCase.php              # Base test case
└── CreatesApplication.php    # Application bootstrapping
```

### 🏭 Factories
- **UserFactory**: Creates test users with configurable roles
- **NoteFactory**: Creates test notes with configurable sharing settings

## 🔧 Running Tests

### All Tests
```bash
php artisan test
```

### Specific Test Suites
```bash
# Feature tests only
php artisan test tests/Feature

# Unit tests only  
php artisan test tests/Unit
```

### Specific Test Files
```bash
# Authentication tests
php artisan test --filter=AuthTest

# Note functionality tests
php artisan test --filter=NoteTest

# User model tests
php artisan test --filter=UserModelTest

# Note model tests
php artisan test --filter=NoteModelTest
```

### With Coverage
```bash
php artisan test --coverage
```

## 📝 Test Coverage

### AuthTest (Feature)
- ✅ User registration with valid data
- ✅ Registration validation (invalid email, short password, duplicate email)
- ✅ User login with valid/invalid credentials
- ✅ User profile access (authenticated/unauthenticated)
- ✅ User logout functionality

### NoteTest (Feature)
- ✅ Note creation with valid data
- ✅ Note creation validation (missing title/content)
- ✅ Note viewing permissions (own notes, public notes, admin access)
- ✅ Note updating permissions (own notes, admin access)
- ✅ Note deletion permissions (own notes, admin access)
- ✅ Note sharing functionality
- ✅ Shared notes viewing
- ✅ Unauthenticated access prevention

### UserModelTest (Unit)
- ✅ Default role assignment ('user')
- ✅ Admin role creation
- ✅ User-Notes relationship
- ✅ Password hiding in responses
- ✅ Email uniqueness constraint

### NoteModelTest (Unit)
- ✅ Note-User relationship
- ✅ Default values (is_public, shared_with)
- ✅ Type casting (array, boolean)
- ✅ Fillable fields verification
- ✅ Timestamp functionality

## 🎯 Test Scenarios

### Authentication Flow
1. Register new user → Get JWT token
2. Login existing user → Get JWT token  
3. Access protected routes → Verify authorization
4. Logout → Invalidate token

### Note Management Flow
1. Create note → Verify ownership
2. View notes → Check visibility rules
3. Update note → Verify permissions
4. Share note → Add to shared_with array
5. Delete note → Verify ownership
6. Admin access → Can manage all notes

### Permission Testing
- **User permissions**: Own notes + public notes + shared notes
- **Admin permissions**: All notes in system
- **Unauthenticated**: No access to protected routes

## 🚀 Spanish Messages Testing
All validation and error messages are tested in Spanish:
- Validation errors: "El campo [nombre] es obligatorio"
- Authentication errors: "Credenciales inválidas"
- Authorization errors: "No autorizado"
- Success messages: "Nota eliminada correctamente"

## 📊 Test Statistics
- **Total Tests**: 37
- **Total Assertions**: 98
- **Success Rate**: 100%
- **Coverage Areas**: Authentication, Note Management, Model Relationships, Permissions

## 🛠️ Test Configuration
- **Database**: SQLite in-memory (`:memory:`)
- **Environment**: Testing
- **Cache**: Array driver
- **Queue**: Sync driver
- **Factories**: Comprehensive user and note factories

## 🔄 Continuous Testing
Tests are designed to be:
- **Fast**: Use in-memory database
- **Isolated**: Each test runs in transaction
- **Comprehensive**: Cover all major functionality
- **Maintainable**: Clear test names and structure
