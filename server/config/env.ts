// Environment configuration
export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://pranavprakash23524_db_user:mongopass321@cluster0.jabpxyq.mongodb.net/expense-management'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
  }
};
