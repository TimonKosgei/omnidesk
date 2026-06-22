const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    passwordHash:{
        type: String,
        required:true,
    },
    role:{
        type: String,
        enum:["staff","technician","supervisor","admin"],
        default:"staff",
        required: true,
    },
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Department",
        required: true,
    },
    phone:{
        type:String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})



const departmentSchema = new mongoose.Schema(
    {
    name:{
        type:String,
        required: true,
        unique:true,
    },
    description:{
        type:String,
        required: true,
    }
    }
)
const locationSchema = new mongoose.Schema(
    {
    building:{
        type: String,
        required: true,
    },
    floor:{
        type:String,
        required:true,
    },
    room:{
        type:String,
        required:true,
    },
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Department",
        required: true
    }
}
);

const assetSchema = new mongoose.Schema({
    assetTag: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
        "computer",
        "printer",
        "projector",
        "switch",
        "router",
        "server",
        "other"
    ],
    },
    serialNumber: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Location",
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Department",
        required: true
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    warrantyExpiry: {
        type: Date,
        required: true
    },
    status:{
        type: String,
        enum:["active","under_repair","lost","retired"],
        default:"active",
        required: true,
    },
    condition:{
        type:String,
        enum:["excellent","good","fair","poor"],
        default:"good",
        required:true
    },
     maintenanceHistory:[{
        date: {
            type:Date,
            default:Date.now
        },
        technician: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        notes: String
     }],
});

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId,ref:"User" ,required: true },

    department: { type: mongoose.Schema.Types.ObjectId,ref:"Department",required: true },
    location: { type: mongoose.Schema.Types.ObjectId,ref:"Location", required: true },

    asset: { type: mongoose.Schema.Types.ObjectId, ref:"Asset" },

    priority: { type: String, 
        enum:["low","medium","high","critical"],
        default: "medium" },
    status: { 
        type: String, 
        enum:["pending","assigned","in_progress","resolved","closed"],
        default:"pending",
        required: true },

    assignedTechnician: { type: mongoose.Schema.Types.ObjectId,ref:"User" },
    resolutionNotes: { type: String, default: "" },
    comments:[
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        message:String,
        createdAt:{
            type:Date,
            default:Date.now
        }
    }
    ]
},{
    timestamps:true,
});

// Compile Models
const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);
const Location = mongoose.model('Location', locationSchema);
const Asset = mongoose.model('Asset', assetSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);



module.exports = {User, Department, Location, Asset, Ticket};
