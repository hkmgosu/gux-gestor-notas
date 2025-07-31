#!/bin/bash

# Test runner script for Laravel application

echo "🧪 Running Laravel Tests..."
echo "================================"

# Run all tests
echo "📋 Running all tests:"
php artisan test

echo ""
echo "📊 Running tests with coverage (if needed):"
echo "   Run: php artisan test --coverage"

echo ""
echo "🔍 Running specific test suites:"
echo "   Feature tests: php artisan test tests/Feature"
echo "   Unit tests: php artisan test tests/Unit"

echo ""
echo "🎯 Running specific test files:"
echo "   Auth tests: php artisan test --filter=AuthTest"
echo "   Note tests: php artisan test --filter=NoteTest"
echo "   User Model tests: php artisan test --filter=UserModelTest"
echo "   Note Model tests: php artisan test --filter=NoteModelTest"

echo ""
echo "✅ All tests completed!"
