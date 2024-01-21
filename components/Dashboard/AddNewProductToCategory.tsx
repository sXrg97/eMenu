"use client";

import { ChangeEvent, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { addProductToCategory } from "@/lib/actions/menu.actions";
import { toast } from "../ui/use-toast";
import { MenuType } from "@/types/types";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

const AddNewProductToCategory = ({
    categoryName,
    menuId,
    setMenu,
}: {
    categoryName: string;
    menuId: string | null;
    setMenu: React.Dispatch<React.SetStateAction<MenuType | null>>;
}) => {
    const [product, setProduct] = useState({ name: "", price: 0, description: "" });
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<any>(null);
    const clerkUser = useUser();
  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        setSelectedImage(file);
  
        // Display a preview of the selected image
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    if (!menuId) return null;

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        // Manual validation
        if (!product.name || !product.price || !product.description) {
            // Display an error message or prevent the save action
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill out all required fields.",
            });
            return;
        }

        try {
            const newFileName = `product_picture_${product.name}_${clerkUser.user?.id}_${Date.now()}.png`;

            const renamedImage = new File([selectedImage], newFileName, {
                type: selectedImage.type,
              });

            const formData = new FormData();
            formData.append('productPicture', renamedImage);

            const res = await addProductToCategory(menuId, categoryName, product, formData);
            if (res) {
                toast({
                    variant: "success",
                    title: `Success! 🎉`,
                    description: `Produsul ${product.name} a fost adaugat cu succes!`,
                });
                setMenu(res);
            } else {
                toast({
                    variant: "destructive",
                    title: `Ceva nu a mers bine! 😕`,
                    description: `Produsul ${product.name} nu a putut fi adaugat!`,
                });
            }
        } catch (error) {
            console.log("Error adding category: ", error);
        }
    };
    

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-dashed border-gray-400 h-full">Adauga Produs +</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adauga produs nou in {categoryName}</DialogTitle>
                    <DialogDescription>
                        Introduceti numele, pretul si descrierea produsului. Apasati Salveaza cand ati terminat.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="productPicture" className="text-right">
                            Imagine
                        </Label>
                        <Input
                            type="file"
                            accept="image/*"
                            name="productPicture"
                            id="productPicture"
                            placeholder="Incarca imaginea ta"
                            className="col-span-3"
                            onChange={handleImageChange}
                        />
                        {imagePreview &&<><span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right"></span> <Image alt="product image" src={imagePreview} width={100} height={100} /></>}
                    </div>
                </div>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nume
                        </Label>
                        <Input
                            name="name"
                            type="text"
                            id="name"
                            placeholder="ex. Carbonara"
                            className="col-span-3"
                            onChange={(e) => onChangeHandler(e)}
                            value={product.name}
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Pret
                        </Label>
                        <Input
                            name="price"
                            type="number"
                            id="price"
                            step={0.01}  // Adjusted step for two decimal places
                            pattern="^\d*(\.\d{0,2})?$"
                            placeholder="ex. 23"
                            className="col-span-3"
                            onChange={(e) => {onChangeHandler(e)}}
                            value={product.price}
                            required
                        />

                    </div>
                </div>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Descriere
                        </Label>
                        <Input
                            name="description"
                            type="text"
                            id="description"
                            placeholder="ex. Cele mai bune paste din lume 😍"
                            className="col-span-3"
                            onChange={(e) => onChangeHandler(e)}
                            value={product.description}
                            required
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild onClick={() => {console.log("hello")}}>
                        <Button>
                            Inchide
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSave}>
                        Salveaza
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddNewProductToCategory;
