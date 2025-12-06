# Permission Module Setup Guide

This guide will help you set up and use the new permission module system.

## Prerequisites

1. Ensure you have Node.js 18+ installed
2. Ensure your database is running and accessible
3. Install dependencies: `npm install`

## Step 1: Install Additional Dependencies

The seed file requires `tsx` to run TypeScript files:

```bash
npm install --save-dev tsx
```

## Step 2: Run Database Migration

Create and apply the database migration for the new Permission models:

```bash
npx prisma migrate dev --name add_permission_system
```

This will:
- Create the `Permission` model
- Create the `UserPermission` junction table
- Add `mustChangePassword` and `passwordChangedAt` fields to the User model

## Step 3: Seed the Database

Run the seed script to populate the database with:
- 10 MDAs
- All permission records (for all modules and actions)
- 1 SuperAdmin user with all permissions

```bash
npm run seed
```

**Important**: The seed script will output a generated password for the admin user. Save this password securely!

The admin user credentials will be:
- Email: `admin@etrack.gov`
- Password: (generated, shown in console)
- Must change password on first login: Yes

## Step 4: Verify Setup

1. Check that permissions were created:
   - Visit `/permissions` page to see all permissions
   - You should see permissions organized by module

2. Test admin login:
   - Use the generated password from the seed output
   - You should be prompted to change password on first login

3. Test permission assignment:
   - Go to `/users` page
   - Create or edit a user
   - You should see permission selection checkboxes

## Permission System Overview

### Modules
The system includes permissions for these modules:
- USER, MDA, PROJECT, SUBMISSION, BUDGET, EXPENDITURE, REVENUE
- PROCUREMENT, TENDER, BID, AWARD, AUDIT, EVENT, MEETING
- PAYMENT, DASHBOARD, CONTRACT

### Actions
Each module supports these actions:
- CREATE, READ, UPDATE, DELETE, EXPORT
- APPROVE, REJECT (for applicable modules)
- UPLOAD (for budget, expenditure, revenue)
- MANAGE (for projects, procurement, tenders, meetings)

### API Protection
All module API routes now check permissions:
- `/api/projects` - Requires PROJECT permissions
- `/api/budget` - Requires BUDGET permissions
- `/api/expenditure` - Requires EXPENDITURE permissions
- `/api/revenue` - Requires REVENUE permissions
- `/api/tenders` - Requires TENDER permissions
- `/api/awards` - Requires AWARD permissions
- `/api/submissions` - Requires SUBMISSION permissions
- `/api/audit` - Requires AUDIT permissions
- `/api/contract` - Requires CONTRACT permissions

## User Management

### Creating Users with Permissions

1. Go to `/users` page
2. Click "Add New User"
3. Fill in user details
4. Check "Generate password" if you want to generate a password
5. Select permissions from the permission selector
6. Click "Create User"

### Managing User Permissions

1. Go to `/users` page
2. Click on a user to view details
3. Click "Manage Permissions" button
4. Select/deselect permissions
5. Click "Save Permissions"

### Generating Passwords

1. Go to user detail page (`/users/[id]`)
2. Click "Generate New Password" button
3. Copy the generated password
4. Share it securely with the user
5. User must change password on next login

## Password Change Flow

When a user has `mustChangePassword: true`:
1. User logs in
2. Password change dialog appears (forced)
3. User enters new password
4. Password is updated and `mustChangePassword` is set to false

## Migration from Role-Based to Permission-Based

The system maintains backward compatibility:
- Old role-based permission checks still work
- New database permission checks are preferred
- You can gradually migrate to database permissions

## Troubleshooting

### Seed script fails
- Ensure database is running
- Check DATABASE_URL in `.env`
- Run `npx prisma generate` first

### Permissions not showing
- Ensure seed script ran successfully
- Check database for Permission records
- Verify API route `/api/permissions` returns data

### Permission checks failing
- Ensure user has permissions assigned
- Check that `getUserInfoFromHeaders` returns valid userId
- Verify permission middleware is being called

## Next Steps

1. Assign permissions to existing users based on their roles
2. Update authentication system to use real user sessions
3. Implement permission checks in UI components
4. Add permission-based route protection
5. Set up role templates for common permission sets

