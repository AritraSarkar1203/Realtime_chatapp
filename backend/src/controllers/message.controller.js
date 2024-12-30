import mongoose from "mongoose";
import User from "../models/user.models.js"
import Message from "../models/message.model.js"

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserforSidebar=async (req,res)=>{
    try{
        const loggedInUserId =req.user._id;
        const filteredUsers= await User.find({_id:{$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    }
    catch(error){
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessage =async(req,res)=>{
    try{
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

       

        if (!mongoose.Types.ObjectId.isValid(myId) || !mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ error: "Invalid user ID(s)" });
        }

        const messages = await Message.find({
        $or: [
            { senderId: myId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: myId },
        ],
        });

        res.status(200).json(messages);
    }
    catch(error){
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

};

export const sendMessage =async(req,res)=>{
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
    
        let imageUrl;
        if (image) {
          // Upload base64 image to cloudinary
          const uploadResponse = await cloudinary.uploader.upload(image);
          imageUrl = uploadResponse.secure_url;
        }
    
        const newMessage = new Message({
          senderId,
          receiverId,
          text,
          image: imageUrl,
        });
    
        await newMessage.save();
    
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    
        res.status(201).json(newMessage);
      } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
      }
};