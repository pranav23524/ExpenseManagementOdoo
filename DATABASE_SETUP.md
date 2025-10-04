# Database Setup Instructions

## MongoDB Configuration

To connect to your MongoDB Atlas database, you need to replace the password placeholder in the configuration file.

### Step 1: Update Database Password

1. Open `server/config/env.ts`
2. Replace `YOUR_ACTUAL_PASSWORD_HERE` with your actual MongoDB Atlas password
3. The connection string should look like:
   ```
   mongodb+srv://pranavprakash23524_db_user:your_actual_password@cluster0.jabpxyq.mongodb.net/expense-management
   ```

### Step 2: Alternative - Use Environment Variables

You can also set the `MONGODB_URI` environment variable instead of modifying the file:

1. Create a `.env.local` file in the root directory
2. Add the following line:
   ```
   MONGODB_URI=mongodb+srv://pranavprakash23524_db_user:your_actual_password@cluster0.jabpxyq.mongodb.net/expense-management
   ```

### Step 3: Seed the Database

Once the connection is configured, run the seed script to populate the database with dummy data:

```bash
npm run seed
```

This will create:
- 1 Company: TechCorp Solutions
- 1 Admin user: admin@techcorp.com (password: admin123)
- 2 Manager users: sarah.manager@techcorp.com, mike.manager@techcorp.com (password: manager123)
- 5 Employee users: employee1@techcorp.com to employee5@techcorp.com (password: employee123)
- 3 Approval rules
- 60 Sample expenses (50 historical + 10 pending)

### Step 4: Start the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Database Models

The application uses the following MongoDB collections:

### Users
- Stores user information including roles (admin, manager, employee)
- Includes authentication data and company associations

### Companies
- Stores company information including currency and approval thresholds
- Each user belongs to a company

### Expenses
- Stores expense submissions with categories, amounts, and approval status
- Links to users and includes approval workflow data

### ApprovalRules
- Stores automated approval rules based on amount or category
- Used to determine approval workflow

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Expenses
- `GET /api/expenses` - Get expenses (filtered by user role)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get specific expense
- `PUT /api/expenses/[id]` - Update expense status (approve/reject)
- `DELETE /api/expenses/[id]` - Delete expense

### Users
- `GET /api/users` - Get all users in company
- `POST /api/users` - Create new user (admin only)

### Companies
- `GET /api/companies` - Get company information
- `PUT /api/companies` - Update company settings (admin only)

## Security Notes

- All API endpoints require JWT authentication
- Passwords are hashed using bcrypt
- User roles determine access permissions
- Employees can only see their own expenses
- Managers and admins can see all expenses in their company
