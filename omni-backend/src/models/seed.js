const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Loads JWT_SECRET and MONGO_URI from your .env file

// Import your models precisely as exported
const { Department, Location, Asset, User } = require('./model'); 

// Fetch the database URI from your environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/omidesk';

const seedDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to Database.');

        // 1. Clear existing collection data to ensure clean insertions
        console.log('🗑️ Purging old collection records...');
        await Department.deleteMany({});
        await Location.deleteMany({});
        await Asset.deleteMany({});
        await User.deleteMany({});
        console.log('🧹 Database cleared clean.');

        // ==========================================
        // STEP 1: SEED DEPARTMENTS
        // ==========================================
        console.log('🌱 Seeding Departments...');
        const departments = await Department.insertMany([
            { name: 'ICT Department', description: 'Handles Core Ministry Infrastructure, Networking, and Workstations' },
            { name: 'Human Resources', description: 'Manages Personnel, Onboarding, and Staff Records' },
            { name: 'Finance & Accounts', description: 'Budgetary control, Payments, and Financial Auditing' },
            { name: 'Procurement', description: 'Asset Acquisition, Tenders, and Supply Chain' }
        ]);
        console.log(`✅ Seeded ${departments.length} departments.`);

        // Extract individual department reference IDs
        const ictDeptId = departments[0]._id;
        const hrDeptId = departments[1]._id;
        const financeDeptId = departments[2]._id;

        // ==========================================
        // STEP 2: SEED LOCATIONS
        // ==========================================
        console.log('🌱 Seeding Physical Locations...');
        const locations = await Location.insertMany([
            { building: 'Main Headquarters', floor: '3rd Floor', room: 'Room 304 (ICT Lab)', department: ictDeptId },
            { building: 'Main Headquarters', floor: '1st Floor', room: 'Room 112 (HR Registry)', department: hrDeptId },
            { building: 'Main Headquarters', floor: '2nd Floor', room: 'Room 205 (Accounts Office)', department: financeDeptId }
        ]);
        console.log(`✅ Seeded ${locations.length} locations.`);

        const ictLocationId = locations[0]._id;
        const hrLocationId = locations[1]._id;

        // ==========================================
        // STEP 3: SEED INITIAL USERS / ACCOUNTS
        // ==========================================
        console.log('🌱 Seeding Initial Core Users...');
        const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', 10);
        const techPasswordHash = await bcrypt.hash('TechSecure2026!', 10);

        const users = await User.insertMany([
            {
                name: 'System Administrator',
                email: 'admin@ict.go.ke',
                passwordHash: adminPasswordHash,
                role: 'admin',
                department: ictDeptId,
                phone: '+254711111111'
            },
            {
                name: 'ICT Attachee User',
                email: 'technician@ict.go.ke',
                passwordHash: techPasswordHash,
                role: 'technician',
                department: ictDeptId,
                phone: '+254722222222'
            }
        ]);
        console.log(`✅ Seeded default accounts: admin@ict.go.ke and technician@ict.go.ke`);

        // ==========================================
        // STEP 4: SEED INVENTORY ASSETS
        // ==========================================
        console.log('🌱 Seeding Asset Hardware inventory...');
        const assets = await Asset.insertMany([
            {
                assetTag: 'MIN-ICT-PC-084',
                name: 'HP ProDesk Workstation',
                category: 'computer',
                serialNumber: 'SGH5289XYZ',
                manufacturer: 'HP',
                location: ictLocationId,
                department: ictDeptId,
                purchaseDate: new Date('2024-03-12'),
                warrantyExpiry: new Date('2027-03-12'),
                status: 'active',
                condition: 'excellent'
            },
            {
                assetTag: 'MIN-HR-PRN-022',
                name: 'LaserJet Enterprise M506',
                category: 'printer',
                serialNumber: 'CNB6K24100',
                manufacturer: 'HP',
                location: hrLocationId,
                department: hrDeptId,
                purchaseDate: new Date('2023-06-18'),
                warrantyExpiry: new Date('2026-06-18'),
                status: 'active',
                condition: 'good'
            }
        ]);
        console.log(`✅ Seeded ${assets.length} inventory assets.`);

        console.log('🎉 Database seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Critical error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();