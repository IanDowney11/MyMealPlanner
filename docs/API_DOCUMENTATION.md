# Meal Planner REST API

This API provides endpoints to retrieve planned meals for tonight and tomorrow, designed for integration with Home Assistant and other home automation systems.

## Base URL
```
http://localhost:3002
```

## Authentication
The API requires a `userId` query parameter for all meal endpoints. This should be the Supabase user ID of the authenticated user.

## Endpoints

### Health Check
```
GET /api/health
```
Returns the API server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-10T10:49:56.024Z"
}
```

### Tonight's Meal
```
GET /api/meals/tonight?userId=USER_ID
```
Returns the meal planned for tonight (today's date).

**Parameters:**
- `userId` (required): The Supabase user ID

**Response (Success - 200):**
```json
{
  "date": "2025-10-10",
  "meal": {
    "title": "Spaghetti Bolognese",
    "description": "Classic Italian pasta dish with meat sauce",
    "rating": 4,
    "image": "data:image/jpeg;base64,/9j/4AAQ...",
    "tags": ["Italian", "Pasta", "Comfort Food"],
    "versions": ["with ground beef", "vegetarian option"]
  }
}
```

**Response (No Meal Planned - 404):**
```json
{
  "message": "No meal planned for tonight",
  "date": "2025-10-10"
}
```

### Tomorrow's Meal
```
GET /api/meals/tomorrow?userId=USER_ID
```
Returns the meal planned for tomorrow.

**Parameters:**
- `userId` (required): The Supabase user ID

**Response formats are identical to the tonight endpoint.**

## Error Responses

### Missing userId (400)
```json
{
  "error": "userId parameter is required"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

## Home Assistant Integration

### Configuration
Add this to your Home Assistant `configuration.yaml`:

```yaml
rest:
  - resource: "http://YOUR_SERVER_IP:3002/api/meals/tonight?userId=YOUR_USER_ID"
    sensor:
      - name: "Tonight's Dinner"
        value_template: "{{ value_json.meal.title if value_json.meal else 'No meal planned' }}"
        json_attributes:
          - date
          - meal
    scan_interval: 300 # Check every 5 minutes

  - resource: "http://YOUR_SERVER_IP:3002/api/meals/tomorrow?userId=YOUR_USER_ID"
    sensor:
      - name: "Tomorrow's Dinner"
        value_template: "{{ value_json.meal.title if value_json.meal else 'No meal planned' }}"
        json_attributes:
          - date
          - meal
    scan_interval: 300
```

### Dashboard Card
Add this card to your Lovelace dashboard:

```yaml
type: entities
title: Meal Plan
entities:
  - entity: sensor.tonight_s_dinner
    name: Tonight
  - entity: sensor.tomorrow_s_dinner
    name: Tomorrow
```

## Running the API

### Development
```bash
# Start API server only
npm run server

# Start API server with auto-reload (recommended for development)
npm run server:dev

# Start both frontend and API server with auto-reload
npm run dev:all
```

### Production
Set environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (required for API to bypass RLS)
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment (development/production)

**Important:** You need to add your Supabase service role key to the `.env` file to bypass Row Level Security. You can find this key in your Supabase project settings under "API" > "Project API keys" > "service_role".

**Security Note:** The service role key has admin privileges. Never expose it in client-side code or commit it to version control. Only use it on your secure server environment.

## Getting Your User ID

To find your Supabase user ID:
1. Log into your meal planner application
2. Open browser developer tools (F12)
3. Go to Console tab
4. Run: `(await window.supabase.auth.getUser()).data.user.id`
5. Copy the returned UUID

Alternatively, you can use the debug endpoint:
- Visit: `http://localhost:3002/api/debug/mealplans?userId=YOUR_USER_ID`
- This will show recent meal plans and confirm your user ID is working

## Notes

- The API uses the same database as your web application
- Meals are filtered by user ID for security
- Data is fetched directly from the meal_plans table
- No authentication is required beyond the user ID parameter (suitable for internal home network use)
- CORS is enabled for cross-origin requests
- The API uses Supabase service role key to bypass Row Level Security
- All endpoints return JSON responses
- Error responses include appropriate HTTP status codes