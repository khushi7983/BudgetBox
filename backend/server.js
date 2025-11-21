const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/budgetbox');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  income: { type: Number, default: 0 },
  monthlyBills: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  transport: { type: Number, default: 0 },
  subscriptions: { type: Number, default: 0 },
  miscellaneous: { type: Number, default: 0 },
  month: { type: String, required: true }, // Format: "2025-11"
  lastUpdated: { type: Date, default: Date.now },
  syncStatus: { type: String, enum: ['local', 'pending', 'synced'], default: 'synced' }
});

const User = mongoose.model('User', userSchema);
const Budget = mongoose.model('Budget', budgetSchema);

// Seed demo user
const seedDemoUser = async () => {
  try {
    const existingUser = await User.findOne({ email: 'hire-me@anshumat.org' });
    if (!existingUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('HireMe@2025!', 10);
      
      const demoUser = new User({
        email: 'hire-me@anshumat.org',
        password: hashedPassword
      });
      
      await demoUser.save();
      console.log('Demo user created successfully');
      
      // Create sample budget data
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const sampleBudget = new Budget({
        userId: demoUser._id,
        income: 50000,
        monthlyBills: 15000,
        food: 8000,
        transport: 5000,
        subscriptions: 2000,
        miscellaneous: 3000,
        month: currentMonth
      });
      
      await sampleBudget.save();
      console.log('Sample budget data created');
    }
  } catch (error) {
    console.error('Error seeding demo user:', error);
  }
};

// Routes

// Auth route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get latest budget
app.get('/api/budget/latest', verifyToken, async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    let budget = await Budget.findOne({
      userId: req.userId,
      month: currentMonth
    });
    
    if (!budget) {
      // Create new budget for current month
      budget = new Budget({
        userId: req.userId,
        month: currentMonth
      });
      await budget.save();
    }
    
    res.json(budget);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sync budget data
app.post('/api/budget/sync', verifyToken, async (req, res) => {
  try {
    const { income, monthlyBills, food, transport, subscriptions, miscellaneous, month } = req.body;
    
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    
    let budget = await Budget.findOne({
      userId: req.userId,
      month: currentMonth
    });
    
    if (budget) {
      // Update existing budget
      budget.income = income;
      budget.monthlyBills = monthlyBills;
      budget.food = food;
      budget.transport = transport;
      budget.subscriptions = subscriptions;
      budget.miscellaneous = miscellaneous;
      budget.lastUpdated = new Date();
      budget.syncStatus = 'synced';
    } else {
      // Create new budget
      budget = new Budget({
        userId: req.userId,
        income,
        monthlyBills,
        food,
        transport,
        subscriptions,
        miscellaneous,
        month: currentMonth,
        syncStatus: 'synced'
      });
    }
    
    await budget.save();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      budget
    });
  } catch (error) {
    console.error('Sync budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  seedDemoUser().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Demo login: hire-me@anshumat.org / HireMe@2025!`);
    });
  });
});