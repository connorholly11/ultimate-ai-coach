#!/bin/bash

BASE_URL="https://ultimate-ai-coach-87qd8xd2y-connor-hollys-projects.vercel.app"

echo "Testing Ultimate AI Coach Deployment"
echo "===================================="

# Test home page
echo -n "1. Testing home page... "
if curl -s "$BASE_URL" | grep -q "Ultimate AI Coach"; then
    echo "✓ Success"
else
    echo "✗ Failed"
fi

# Test profile API endpoint
echo -n "2. Testing /api/profile endpoint... "
PROFILE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/profile?anonUid=test-123")
if [ "$PROFILE_STATUS" = "200" ]; then
    echo "✓ Success (Status: $PROFILE_STATUS)"
else
    echo "✗ Failed (Status: $PROFILE_STATUS)"
fi

# Test journey API endpoint
echo -n "3. Testing /api/journey endpoint... "
JOURNEY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/journey?anonUid=test-123")
if [ "$JOURNEY_STATUS" = "200" ]; then
    echo "✓ Success (Status: $JOURNEY_STATUS)"
else
    echo "✗ Failed (Status: $JOURNEY_STATUS)"
fi

# Test chat page
echo -n "4. Testing /chat page... "
if curl -s "$BASE_URL/chat" | grep -q "AI Coach"; then
    echo "✓ Success"
else
    echo "✗ Failed"
fi

# Test journey page
echo -n "5. Testing /journey page... "
if curl -s "$BASE_URL/journey" | grep -q "Journey"; then
    echo "✓ Success"
else
    echo "✗ Failed"
fi

echo ""
echo "Deployment URL: $BASE_URL"
echo "Test the FTUE flow by visiting the site in your browser!"