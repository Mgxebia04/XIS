# Role-Based Authorization Summary

## Public APIs (AllowAnonymous)
These APIs can be accessed without authentication:

1. **POST /api/auth/login** - User login
2. **GET /api/skills** - Get all skills
3. **GET /api/interviewtypes** - Get all interview types
4. **GET /api/positions** - Get all positions
5. **GET /api/interviewees** - Get interviewees (with optional positionId filter)
6. **GET /api/interviewerprofile/all-with-stats** - Get all interviewers with statistics (used by HR in Interviewers page)
7. **GET /api/schedule/all** - Get all scheduled interviews (used by HR dashboard)

## HR Manager Role APIs
These APIs require HR Manager role:

1. **POST /api/schedule/search** - Search for available interviewers
2. **POST /api/schedule/create** - Create/schedule an interview
3. **POST /api/panelrequest/request-panel** - Request a new panel member
4. **GET /api/panelrequest/my-requests** - Get my panel requests
5. **POST /api/auth/change-password** - Change password (all authenticated users)

## Interviewer (Panel) Role APIs
These APIs require Interviewer role and ownership verification:

1. **GET /api/interviewerprofile/{id}** - Get own profile (verified: profile.UserId == currentUserId)
2. **PUT /api/interviewerprofile/{id}** - Update own profile (verified: profile.UserId == currentUserId)
3. **GET /api/availability/interviewer/{id}** - Get own availability (verified: profile.UserId == currentUserId)
4. **POST /api/availability/interviewer/{id}** - Create own availability (verified: profile.UserId == currentUserId)
5. **DELETE /api/availability/{id}** - Delete own availability (verified: slot.InterviewerProfile.UserId == currentUserId)
6. **GET /api/schedule/interviewer/{id}** - Get own schedule (verified: profile.UserId == currentUserId)
7. **PUT /api/schedule/cancel/{id}** - Cancel own interview (verified: interview.InterviewerProfile.UserId == currentUserId)
8. **POST /api/auth/change-password** - Change password (all authenticated users)

## Admin Role APIs
These APIs require Admin role:

1. **POST /api/admin/onboard-hr** - Onboard new HR user
2. **GET /api/admin/panel-requests** - Get all pending panel requests
3. **POST /api/admin/create-panel** - Create panel member from request
4. **POST /api/admin/reject-panel-request/{id}** - Reject panel request
5. **POST /api/auth/change-password** - Change password (all authenticated users)

## Authorization Implementation

### AuthorizationHelper
A centralized helper class (`AuthorizationHelper.cs`) provides:
- `GetCurrentUserId()` - Extract user ID from token
- `GetCurrentUserRoleAsync()` - Get user role from database
- `IsUserInRoleAsync()` - Check if user has specific role
- `IsAdminAsync()` - Check if user is Admin
- `IsHrManagerAsync()` - Check if user is HR Manager
- `IsInterviewerAsync()` - Check if user is Interviewer

### Role Verification
- **Admin endpoints**: Check role == "Admin"
- **HR endpoints**: Check role == "HR Manager"
- **Panel endpoints**: Check role == "Interviewer" AND verify ownership (userId matches)

### Ownership Verification
For Panel (Interviewer) endpoints, we verify:
- The resource belongs to the current user
- Example: `profile.UserId == currentUserId`
- This prevents users from accessing/modifying other users' data

## Security Notes

1. **Token-based authentication**: Simple base64 token (for demo). In production, use JWT.
2. **Role checks**: All role checks are done server-side in controllers.
3. **Ownership verification**: Panel members can only access their own resources.
4. **Forbid responses**: Return 403 Forbid with descriptive messages when authorization fails.
5. **Unauthorized responses**: Return 401 Unauthorized when token is missing or invalid.

## API Access Matrix

| API Endpoint | Public | HR | Panel | Admin |
|-------------|--------|----|----|-------|
| POST /api/auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /api/auth/change-password | ❌ | ✅ | ✅ | ✅ |
| GET /api/skills | ✅ | ✅ | ✅ | ✅ |
| GET /api/interviewtypes | ✅ | ✅ | ✅ | ✅ |
| GET /api/positions | ✅ | ✅ | ✅ | ✅ |
| GET /api/interviewees | ✅ | ✅ | ✅ | ✅ |
| GET /api/interviewerprofile/all-with-stats | ✅ | ✅ | ✅ | ✅ |
| GET /api/interviewerprofile/{id} | ❌ | ❌ | ✅ (own) | ❌ |
| PUT /api/interviewerprofile/{id} | ❌ | ❌ | ✅ (own) | ❌ |
| GET /api/availability/interviewer/{id} | ❌ | ❌ | ✅ (own) | ❌ |
| POST /api/availability/interviewer/{id} | ❌ | ❌ | ✅ (own) | ❌ |
| DELETE /api/availability/{id} | ❌ | ❌ | ✅ (own) | ❌ |
| GET /api/schedule/all | ✅ | ✅ | ✅ | ✅ |
| GET /api/schedule/interviewer/{id} | ❌ | ❌ | ✅ (own) | ❌ |
| POST /api/schedule/search | ❌ | ✅ | ❌ | ❌ |
| POST /api/schedule/create | ❌ | ✅ | ❌ | ❌ |
| PUT /api/schedule/cancel/{id} | ❌ | ❌ | ✅ (own) | ❌ |
| POST /api/panelrequest/request-panel | ❌ | ✅ | ❌ | ❌ |
| GET /api/panelrequest/my-requests | ❌ | ✅ | ❌ | ❌ |
| POST /api/admin/onboard-hr | ❌ | ❌ | ❌ | ✅ |
| GET /api/admin/panel-requests | ❌ | ❌ | ❌ | ✅ |
| POST /api/admin/create-panel | ❌ | ❌ | ❌ | ✅ |
| POST /api/admin/reject-panel-request/{id} | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Allowed
- ❌ = Not allowed
- ✅ (own) = Allowed only for own resources
