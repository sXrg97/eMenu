"use server"

import { connectToDB } from "@/utils/mongoose"
import { User } from "../models/user.model";
import { Menu } from "../models/menu.model";
import mongoose from "mongoose";

export const checkUserOrCreate = async (clerkUserId: string, email: string) => {
    if (!clerkUserId) return null;

    try {
        connectToDB();

        const user = await User.findOne({ clerkUserId: clerkUserId })

        if (user === null) {
            const newMenu = new Menu({
                _id: new mongoose.Types.ObjectId(),
                owner: new mongoose.Types.ObjectId(),
                restaurantName: "My Restaurant",
                isLive: false,
                categories: [],
                lifetimeViews: 0,
                tables: [{tableNumber: 1, callWaiter: false, requestBill: false}],
            });

            const savedMenu = await newMenu.save();

            const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                clerkUserId: clerkUserId,
                email: email,
                name: "",
                image: "",
                menu: savedMenu._id,
            });

            const savedUser = await newUser.save();

            const updateOwner = await Menu.findByIdAndUpdate(savedMenu._id, { $set: { owner: new mongoose.Types.ObjectId(savedUser._id), slug: savedMenu._id } });

            updateOwner.save();

            refreshSockets();

            return savedMenu._id.toJSON();
        } else {
            return user.menu.toJSON();
        }
    } catch (error) {
        console.log(error);
    }
}

const refreshSockets = () => {
    try {
        connectToDB();
        //get all menu id's
        const menus = Menu.find({}, "slug");
        
    } catch (error) {
        console.log(error);
    }
}