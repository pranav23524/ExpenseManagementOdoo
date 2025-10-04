import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Expense } from '../models/Expense';
import { ApprovalRule } from '../models/ApprovalRule';
import bcrypt from 'bcryptjs';

const categories = ['travel', 'meals', 'office', 'equipment', 'other'];
const merchants = [
  'Amazon', 'Uber', 'Starbucks', 'Office Depot', 'Delta Airlines',
  'Hilton Hotels', 'McDonald\'s', 'Apple Store', 'FedEx', 'Google Cloud',
  'Microsoft', 'Adobe', 'Slack', 'Zoom', 'Salesforce'
];

const descriptions = [
  'Business lunch with client',
  'Flight to conference',
  'Office supplies for project',
  'Software license renewal',
  'Hotel accommodation',
  'Taxi to airport',
  'Team dinner',
  'Equipment maintenance',
  'Training materials',
  'Client entertainment'
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Expense.deleteMany({});
    await ApprovalRule.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create company
    const company = new Company({
      name: 'TechCorp Solutions',
      currency: 'USD',
      approvalThreshold: 1000
    });
    await company.save();
    console.log('🏢 Created company:', company.name);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      email: 'admin@techcorp.com',
      password: adminPassword,
      name: 'John Admin',
      role: 'admin',
      companyId: company._id.toString(),
      companyName: company.name
    });
    await admin.save();
    console.log('👤 Created admin user');

    // Create manager users
    const manager1Password = await bcrypt.hash('manager123', 12);
    const manager1 = new User({
      email: 'sarah.manager@techcorp.com',
      password: manager1Password,
      name: 'Sarah Manager',
      role: 'manager',
      companyId: company._id.toString(),
      companyName: company.name
    });
    await manager1.save();

    const manager2Password = await bcrypt.hash('manager123', 12);
    const manager2 = new User({
      email: 'mike.manager@techcorp.com',
      password: manager2Password,
      name: 'Mike Manager',
      role: 'manager',
      companyId: company._id.toString(),
      companyName: company.name
    });
    await manager2.save();
    console.log('👥 Created manager users');

    // Create employee users
    const employees = [];
    for (let i = 1; i <= 5; i++) {
      const password = await bcrypt.hash('employee123', 12);
      const employee = new User({
        email: `employee${i}@techcorp.com`,
        password,
        name: `Employee ${i}`,
        role: 'employee',
        companyId: company._id.toString(),
        companyName: company.name,
        managerId: i <= 3 ? manager1._id.toString() : manager2._id.toString()
      });
      await employee.save();
      employees.push(employee);
    }
    console.log('👨‍💼 Created employee users');

    // Create approval rules
    const approvalRules = [
      {
        companyId: company._id.toString(),
        name: 'High Amount Approval',
        condition: 'amount',
        value: 500,
        approverRole: 'manager',
        enabled: true
      },
      {
        companyId: company._id.toString(),
        name: 'Travel Expenses',
        condition: 'category',
        value: 'travel',
        approverRole: 'manager',
        enabled: true
      },
      {
        companyId: company._id.toString(),
        name: 'Very High Amount Approval',
        condition: 'amount',
        value: 2000,
        approverRole: 'admin',
        enabled: true
      }
    ];

    for (const rule of approvalRules) {
      const approvalRule = new ApprovalRule(rule);
      await approvalRule.save();
    }
    console.log('📋 Created approval rules');

    // Create dummy expenses
    const allUsers = [admin, manager1, manager2, ...employees];
    const expenses = [];

    for (let i = 0; i < 50; i++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const amount = Math.floor(Math.random() * 2000) + 10; // $10 to $2010
      const statuses = ['pending', 'approved', 'rejected'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const expense = new Expense({
        userId: user._id.toString(),
        userName: user.name,
        amount,
        currency: 'USD',
        category,
        description,
        merchant,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        status,
        receiptName: `receipt_${i + 1}.pdf`,
        receiptUrl: `https://example.com/receipts/receipt_${i + 1}.pdf`,
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        approvedBy: status === 'approved' ? (Math.random() > 0.5 ? manager1._id.toString() : manager2._id.toString()) : undefined,
        approvedAt: status === 'approved' ? new Date() : undefined,
        rejectionReason: status === 'rejected' ? 'Expense exceeds policy limits' : undefined
      });

      await expense.save();
      expenses.push(expense);
    }
    console.log('💰 Created dummy expenses');

    // Create some recent pending expenses for testing
    for (let i = 0; i < 10; i++) {
      const user = employees[Math.floor(Math.random() * employees.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const amount = Math.floor(Math.random() * 1000) + 50; // $50 to $1050
      
      const expense = new Expense({
        userId: user._id.toString(),
        userName: user.name,
        amount,
        currency: 'USD',
        category,
        description,
        merchant,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
        status: 'pending',
        receiptName: `pending_receipt_${i + 1}.pdf`,
        receiptUrl: `https://example.com/receipts/pending_receipt_${i + 1}.pdf`,
        submittedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) // Random date within last 3 days
      });

      await expense.save();
    }
    console.log('⏳ Created pending expenses for testing');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 Company: ${company.name}`);
    console.log(`- 1 Admin: admin@techcorp.com (password: admin123)`);
    console.log(`- 2 Managers: sarah.manager@techcorp.com, mike.manager@techcorp.com (password: manager123)`);
    console.log(`- 5 Employees: employee1@techcorp.com to employee5@techcorp.com (password: employee123)`);
    console.log(`- 3 Approval Rules`);
    console.log(`- 60 Total Expenses (50 historical + 10 pending)`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
