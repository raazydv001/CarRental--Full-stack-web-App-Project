import imagekit from "../config/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";

export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Role changed to owner" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Error changing role to owner" });
  }
};

export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;

    // Debug log to check if carData is sent
    console.log("carData received:", req.body.carData);
    console.log("file received:", req.file);

    if (!req.body.carData) {
      return res.status(400).json({ success: false, message: "carData is required" });
    }

    let car;
    try {
      car = JSON.parse(req.body.carData);
    } catch (e) {
      return res.status(400).json({ success: false, message: "carData must be valid JSON" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: req.file.originalname,
      folder: `/cars`,
    });

    const optimizedImageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "1280" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    const image = optimizedImageURL;

    await Car.create({ ...car, owner: _id, image });

    res.json({ success: true, message: "Car Added" });
  } catch (error) {
    console.error("Error in addCar:", error);
    res.status(500).json({ success: false, message: "Error adding car" });
  }
};

// API TO LIST OWNER CARS
  export const getOwnerCars = async(req,res) =>{
    try {
      const {_id} = req.user;
      const cars = await Car.find({owner:_id})
      res.json({success:true , cars});

      
    } catch (error) {
      console.error("Error in addCar:", error);
    res.status(500).json({ success: false, message: "Error adding car" });
  }  
  }

  // API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId); // ✅ was `cars`

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvaliable = !car.isAvaliable;
    await car.save();

    res.json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    console.error("Error in toggleCarAvailability:", error);
    res.status(500).json({ success: false, message: "Error toggling availability" });
  }
};


  // API to Delete a car
 export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    const car = await Car.findById(carId); // ✅ was `cars`

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.owner = null;
    car.isAvaliable = false;
    await car.save();

    res.json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCar:", error);
    res.status(500).json({ success: false, message: "Error deleting car" });
  }
};


  // API to get dashboard data 
  export const getDashboardData = async (req, res) => {
    try {
      const {_id, role} = req.user;

      if(role !== 'owner'){
        return res.json({success:false,message:"Unauthorized"})
      }

      const cars = await Car.find({owner: _id});
      const bookings = await Booking.find({owner:_id}).populate('car').
      sort({createdAt: -1});

      const pendingBookings = await Booking.find({owner:_id,status:"pending"})
     const completeBookings = await Booking.find({owner:_id,status:"confirmed"})

    //  Calculate monthlyRevenue from bookings where status is confirmed
    const monthlyRevenue = bookings.slice().filter(booking => booking.
      status === 'confirmed').reduce((acc,booking) => acc + booking.price , 0)

      const dashboardData = {
        totalCars : cars.length,
        totalBookings : bookings.length ,
        pendingBookings : pendingBookings.length ,
        completeBookings : completeBookings.length ,
        recentBookings: bookings.slice(0,3),
        monthlyRevenue
      }
      res.json({success:true ,dashboardData});
      
    } catch (error) {
        console.error("Error in addCar:", error);
    res.status(500).json({ success: false, message: "Error adding car" });
      
    }
  }

  // API to update user image
  export const updateUserImage = async (req, res) => {
      try {
        const {_id} = req.user; 
        const imageFile = req.file;

    const fileBuffer = fs.readFileSync(imageFile.path);

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: '/users'
    });

    const optimizedImageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "400" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    const image = optimizedImageURL;

    await User.findByIdAndUpdate(_id,{image});
    res.json({success:true ,message:"Image updated"});
        
      } catch (error) {
        console.error("Error in addCar:", error);
    res.status(500).json({ success: false, message: "Error adding car" });
      
        
      }

  }
