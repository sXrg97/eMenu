"use server";

import { connectToDB } from "@/utils/mongoose";
import { Menu } from "../models/menu.model";
import { MenuType, ProductType } from "@/types/types";
import { jsonify } from "../utils";
import { UTApi } from "uploadthing/server";
import mongoose from "mongoose";

export const fetchMenu = async (menuId: string) => {
    if (!menuId) return null;
    try {
        connectToDB();
        const menu = await Menu.findById(menuId);
        const jsonMenu = menu.toJSON();

        return jsonify(jsonMenu);
    } catch (error) {
        console.log("fetchMenu error: ", error);
    }
};

export const fetchMenuBySlug = async (slug: string) => {
    if (!slug) return null;
    try {
        connectToDB();
        const menu = await Menu.findOne({ slug });

        return jsonify(menu);
    } catch (error) {
        console.log("fetchMenu error: ", error);
    }
};

export const UpdateMenuInfo = async (menuId: string, newRestaurantName: string, slug: string, tables: number) => {
    if (!menuId) return { status: 400, message: "Invalid menuId" };

    console.log(menuId, newRestaurantName, slug);

    try {
        connectToDB();

        // Find the menu by ID to get its current slug
        const existingMenu = await Menu.findById(menuId);

        if (!existingMenu) {
            return { status: 400, message: "Menu not found" };
        }

        console.log("menu exists");

        // Check if the new slug is already in use (excluding the current document)
        const slugExists = await Menu.exists({ slug, _id: { $ne: existingMenu._id } });

        console.log(slugExists);

        if (slugExists) {
            console.log("slug exists");
            return { status: 400, message: "This slug is already in use" };
        }

        console.log("menu");
        console.log(existingMenu);

        // If the slug is unique, update the restaurantName and slug
        const updatedMenu = await Menu.findByIdAndUpdate(
            menuId,
            { $set: { restaurantName: newRestaurantName, slug: slug } },
            { new: true }
        );

        // Check if the tables field exists, if not, create it
        if (!updatedMenu.tables) {
            updatedMenu.tables = [];
        }

        // Create or replace tables based on the provided number
        updatedMenu.tables = Array.from({ length: tables }, (_, index) => {
            const tableNumber = index + 1;
            return {
                tableNumber,
                callWaiter: false,
                requestBill: false,
            };
        });
        
        // Save the updated menu
        await updatedMenu.save();

        console.log("updated menu: ");
        console.log(updatedMenu);

        const jsonifiedUpdatedMenu = await jsonify(updatedMenu);

        console.log("josnified menu");
        console.log(jsonifiedUpdatedMenu);

        return { status: 200, message: "Menu updated successfully", jsonifiedUpdatedMenu };
    } catch (error) {
        console.error(error);
        return { status: 500, message: "Internal Server Error" };
    }
};

export const addCategory = async (menuId: string, categoryName: string) => {
    try {
        connectToDB();

        const existingMenu = (await Menu.findById(menuId)) as MenuType;

        // Check if a category with the same name already exists
        const categoryExists = existingMenu.categories.some((category) => category.name === categoryName);

        if (categoryExists) {
            // Handle the case where the category already exists (e.g., return an error)
            const res = {
                success: false,
                error: "Aceasta categorie exista deja",
            };
            return res;
        } else {
            // If the category doesn't exist, add it to the categories array
            const updatedMenu = await Menu.findByIdAndUpdate(
                menuId,
                { $push: { categories: { name: categoryName, products: [] } } },
                { new: true } // This option returns the updated document
            );
            // Handle success
            if (updatedMenu) {
                // Update the component's state with the updated menu
                console.log("Category added:", updatedMenu);
                const res = {
                    success: true,
                    updatedMenu: jsonify(updatedMenu),
                };
                return res;
            } else {
                console.log("Menu not found or category not added.");
            }
        }
    } catch (error) {
        console.log("Failed to add category: ", error);
    }
};

export const addProductToCategory = async (
    menuId: string,
    categoryName: string,
    product: object,
    formData: FormData
) => {
    try {
        connectToDB();
        console.log(product);

        console.log({ menuId, categoryName, product });

        const menu = await Menu.findById(menuId);

        console.log({ menu });

        if (!menu) throw new Error("Menu not found");

        const category = menu.categories.find((cat: any) => cat.name === categoryName);

        console.log({ category });

        if (!category) throw new Error(`Category "${categoryName}" not found in the menu`);

        //Now that the category is found, upload the image to UploadThing
        const utapi = new UTApi();
        const response = await utapi.uploadFiles([formData.get("productPicture")]);
        console.log("UT response: ", response);

        let productPictureUrl;

        // Check if response is an array and has the expected structure
        if (Array.isArray(response) && response.length > 0 && response[0]?.data?.url) {
            productPictureUrl = response[0].data.url;
        } else {
            console.error("Unexpected response format from UTApi:", response);
            // Handle the error or set a default value for productPictureUrl
        }

        const productWithPicture = {
            ...product,
            image: productPictureUrl,
            _id: new mongoose.Types.ObjectId(),
        };

        category.products.push(productWithPicture);

        const updatedMenu = await menu.save();

        return jsonify(updatedMenu);
    } catch (error) {
        console.log("Error adding product to category: ", error);
    }
};

export const uploadMenuPreviewImage = async (menuId: string, menuPreviewImage: string) => {
    try {
        connectToDB();

        const utapi = new UTApi();

        const menu = await Menu.findById(menuId);

        if (!menu) {
            throw new Error("Menu not found");
        }

        const existingMenuPreviewImage = menu.menuPreviewImage;

        let existingImageFilename;

        if (existingMenuPreviewImage) {
            existingImageFilename = existingMenuPreviewImage.replace("https://utfs.io/f/", "");
            console.log("preview img: ", existingImageFilename);
        }

        const updatedMenu = await Menu.findByIdAndUpdate(
            menuId,
            { $set: { menuPreviewImage: menuPreviewImage } },
            { new: true }
        );

        console.log("updated menu: ", updatedMenu);

        if (existingImageFilename) {
            await utapi.deleteFiles([existingImageFilename]);
        }

        return jsonify(updatedMenu);
    } catch (error) {
        console.error("Error uploading menu preview image: ", error);
    }
};

export const deleteProduct = async (menuId: string, categoryName: string, productId: string) => {
    console.log("INFO ON DELETE PRODUCT");
    console.log(menuId, categoryName, productId);
    try {
        connectToDB();

        const menu = await Menu.findOneAndUpdate(
            { "categories.products._id": productId },
            { $pull: { "categories.$.products": { _id: productId } } },
            { new: true }
        );

        const updatedMenu = await menu.save();

        return jsonify(updatedMenu);
    } catch (error) {
        console.log("Error deleting product: ", error);
    }
};

export const deleteCategory = async (menuId: string, categoryName: string) => {
    try {
        connectToDB();

        const menu = await Menu.findById(menuId);

        const categoryIndex = menu.categories.findIndex((cat: any) => cat.name === categoryName);

        menu.categories.splice(categoryIndex, 1);

        const updatedMenu = await menu.save();

        return jsonify(updatedMenu);
    } catch (error) {
        console.log("Error deleting category: ", error);
    }
};

export const renameCategory = async (menuId: string, categoryName: string, newCategoryName: string) => {
    try {
        connectToDB();

        const menu = await Menu.findById(menuId);

        const category = menu.categories.find((cat: any) => cat.name === categoryName);

        category.name = newCategoryName;

        const updatedMenu = await menu.save();

        return jsonify(updatedMenu);
    } catch (error) {
        console.log("Error renaming category: ", error);
    }
};

export const getRandomMenus = async (limit: number) => {
    try {
        connectToDB();

        const menus = await Menu.aggregate([{ $sample: { size: limit } }]);

        return jsonify(menus);
    } catch (error) {
        console.log("Error getting random menus: ", error);
    }
};

export const increaseMenuViews = async (menuId: string) => {
    try {
        connectToDB();

        const menu = await Menu.findById(menuId);

        if (!menu) {
            throw new Error("Menu not found");
        }

        if (!menu.lifetimeViews) {
            menu.lifetimeViews = 1;
        } else {
            menu.lifetimeViews++;
        }

        const updatedMenu = await menu.save();
        console.log(updatedMenu);
    } catch (error) {
        console.log("Error increasing menu views: ", error);
    }
}

export const editProductImage = async (menuId: string, categoryName: string, productId: string, formData: FormData) => {
    console.log("edit product image")

    try {
        connectToDB();
        const menu = await Menu.findById(menuId);
        const category = menu.categories.find((cat: any) => cat.name === categoryName);
        const product = category.products.find((prod: any) => prod._id.toString() === productId);
        const utapi = new UTApi();
        let existingImageFilename = product.image.replace("https://utfs.io/f/", "");

        const uploadNewImageResponse = await utapi.uploadFiles([formData.get("productPicture")]);

        let newImageUrl;

        if (uploadNewImageResponse[0]?.data?.url) {
            newImageUrl = uploadNewImageResponse[0].data.url;
        }

        product.image = newImageUrl;

        const updatedMenu = await menu.save();

        await utapi.deleteFiles([existingImageFilename]);

        return jsonify(updatedMenu);
    } catch (err) {
        console.log("Error editing product image: ", err);
    }
}

export const editProduct = async (menuId: string, categoryName: string, productId: string , editedProduct: ProductType) => {
    console.log("edit product")

    try {
        connectToDB();
        const menu = await Menu.findById(menuId);
        const category = menu.categories.find((cat: any) => cat.name === categoryName);
        const product = category.products.find((prod:any) => prod._id.toString() === productId);

        product.name = editedProduct.name;
        product.description = editedProduct.description;
        product.price = editedProduct.price;
        product.isReduced = editedProduct.isReduced;
        product.reducedPrice = editedProduct.reducedPrice;
        product.isDiscountProcentual = editedProduct.isDiscountProcentual;
        product.allergens = editedProduct.allergens;

        const updatedMenu = await menu.save();

        return jsonify(updatedMenu);
    } catch (err) {
        console.log("Error editing product: ", err);
    }
}

export const editProductAndImage = async (menuId: string, categoryName: string, productId: string, editedProduct: ProductType, formData: FormData) => {
    try {
        connectToDB();
        const menu = await Menu.findById(menuId);
        const category = menu.categories.find((cat: any) => cat.name === categoryName);
        const product = category.products.find((prod: any) => prod._id.toString() === productId);
        const utapi = new UTApi();
        let existingImageFilename = product.image.replace("https://utfs.io/f/", "");

        const uploadNewImageResponse = await utapi.uploadFiles([formData.get("productPicture")]);

        let newImageUrl;

        if (uploadNewImageResponse[0]?.data?.url) {
            newImageUrl = uploadNewImageResponse[0].data.url;
        }

        product.image = newImageUrl;

        await utapi.deleteFiles([existingImageFilename]);
        
        product.name = editedProduct.name;
        product.description = editedProduct.description;
        product.price = editedProduct.price;
        product.isReduced = editedProduct.isReduced;
        product.reducedPrice = editedProduct.reducedPrice;
        product.isDiscountProcentual = editedProduct.isDiscountProcentual;
        product.allergens = editedProduct.allergens;
        
        const updatedMenu = await menu.save();
        
        return jsonify(updatedMenu);
    } catch (err) {
        console.log("Error editing product and image: ", err);
    }
}

export const callWaiter = async (menuId: string, tableNumber: number, action: boolean) => {
    try {
        connectToDB();
        const menu = await Menu.findById(menuId);
        const table = menu.tables.find((table: any) => table.tableNumber === tableNumber);

        if (!table) {
            throw new Error("Table not found");
        }

        table.callWaiter = action;

        const updatedMenu = await menu.save();

        return jsonify(updatedMenu);
    } catch (error) {
        console.log("Error calling waiter: ", error);
    }
}

export const requestBill = async (menuId: string, tableNumber: number, action: boolean) => {
    try {
        connectToDB();
        const menu = await Menu.findById(menuId);
        const table = menu.tables.find((table: any) => table.tableNumber === tableNumber);

        if (!table) {
            throw new Error("Table not found");
        }

        table.requestBill = action;

        const updatedMenu = await menu.save();

        return jsonify(updatedMenu);
    } catch (error) {
        console.log("Error calling waiter: ", error);
    }
}

export const getTables = async (menuId: string) => {
    try {
        connectToDB();
        const menu = await Menu.findById(menuId);

        return jsonify(menu.tables);
    } catch (error) {
        console.log("Error getting tables: ", error);
    }
}