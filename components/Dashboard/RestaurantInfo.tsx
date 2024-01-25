import React, { useEffect, useState } from "react";
import { deleteCategory, fetchMenu, uploadMenuPreviewImage } from "@/lib/actions/menu.actions";
import {  ImageIcon, LinkIcon, Loader2Icon, PenIcon, Trash2Icon } from "lucide-react";
import { MenuType } from "@/types/types";
import { useToast } from "../ui/use-toast";
import AddCategoryButton from "../Backend/AddCategoryButton";
import Image from "next/image";
import Link from "next/link";
import AddNewProductToCategory from "./AddNewProductToCategory";
import { UploadButton } from "@/utils/uploadthing";
import { Skeleton } from "../ui/skeleton";
import EditRestaurantModal from "../Backend/EditRestaurantModal";
import ProductBox from "../Backend/ProductBox";
import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import EditCategoryNameButton from "../Backend/EditCategoryNameButton";
import ImportantUpdates from "./ImportantUpdates";

const RestaurantInfo = ({ menuId }: { menuId: string | null }) => {
    const [menu, setMenu] = useState<null | MenuType>(null);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
    const { toast } = useToast();

    useEffect(() => {
        const getMenu = async () => {
            try {
                if (!menuId) return;
                const responseMenu = await fetchMenu(menuId);
                if (responseMenu) {
                    setMenu(responseMenu);
                    console.log("menu", responseMenu);
                }
            } catch (error) {
                console.error("Error getting menu:", error);
            }
        };
        getMenu();
    }, [menuId]);

    const handleDeleteCategory = async (menuId: string, categoryName: string) => {
        if (!menuId) return;
        if (!categoryName) return;

        if (!confirm("Sunteti sigur ca doriti sa stergeti aceasta categorie?")) return;

        try {
            setIsPageLoading(true);
            const response = await deleteCategory(menuId, categoryName);

            if (response) {
                setMenu(response);

                toast({
                    variant: "success",
                    title: `Success! 🎉`,
                    description: `Categoria ${categoryName} a fost stearsa cu succes!`,
                });
            }
        } catch (err) {
            console.log("Error deleting category:", err);
            toast({
                variant: "destructive",
                title: `Ceva nu a mers bine! 😕`,
                description: `Categoria ${categoryName} nu a putut fi stearsa!`,
            });
        } finally {
            setIsPageLoading(false);
        }

    }
    
    const clerkUser = useUser();

    return (
        <div>
            <div className="w-full mb-8">
                {menu && <ImportantUpdates menu={menu} />}
            </div>
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg relative mb-4">
                {menu ? 
                <Image
                className="bg-black w-full object-cover h-full"
                alt="Restaurant Cover Image"
                src={`${menu?.menuPreviewImage ? menu.menuPreviewImage : '/dashboard-cover.webp'}`}
                // to fix the image showing the preview before loading the menu
                width={1600}
                height={1200}
                />

                : <Skeleton className="w-full h-full bg-black"/>
                }
                
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20"></div>
                {menu && (
                    <div className="absolute top-0 left-0 text-white flex items-center justify-between w-full px-4 py-3">
                        <span className="text-2xl">{menu.restaurantName}</span>
                        <Link className="flex" href={`/menu/${menu.slug}`}>
                            <span>Go to website</span>
                            <LinkIcon size={12} />
                        </Link>
                    </div>
                )}
            </div>

            {menu && menu.lifetimeViews && <span className="italic text-gray-400 mb-4 block">Lifetime Views: {menu.lifetimeViews}</span>}

            <div className="flex items-center gap-4 mb-4">
                {menuId && 
                    <>
                        {menu && <EditRestaurantModal menu={menu} setMenu={setMenu}/>}

                        <UploadButton
                            onBeforeUploadBegin={(files) => {
                                // Preprocess files before uploading (e.g. rename them)
                                return files.map(
                                    (f) => new File([f], "coverImage_" + clerkUser.user?.id + "_" + Date.now() + "_" + f.name , { type: f.type }),
                                );
                            }}
                         className="ml-auto"
                        content={{
                            button: <div className="flex"><ImageIcon className="mr-1"/>Incarca poza de coperta</div>
                        }}
                            appearance={{
                                button: {
                                    width: '100%',
                                    padding: '8px 16px'
                                },
                                allowedContent: {
                                    display: 'none',
                                    width: "100%"
                                }
                            }}
                            endpoint="imageUploader"
                            onClientUploadComplete={async (res) => {
                                if (!res) return;
                                    try {
                                        const newMenu = await uploadMenuPreviewImage(menuId ,res[0].url)
                                        setMenu(newMenu);

                                        toast({
                                            variant: "success",
                                            title: `Success! 🎉`,
                                            description: `Poza de coperta a fost modificata cu succes!`,
                                        });
                                    } catch (error) {
                                        console.log(error);

                                        toast({
                                            variant: "destructive",
                                            title: `Ceva nu a mers bine! 😕`,
                                            description: `Poza de coperta nu a putut fi modificata!`,
                                        });
                                    }
                                    
                                }
                            }
                            onUploadError={(error: Error) => {
                                console.log(`ERROR! ${error.message}`);

                                toast({
                                    variant: "destructive",
                                    title: `Ceva nu a mers bine! 😕`,
                                    description: `Poza de coperta nu a putut fi modificata!`,
                                });
                            }}
                        />
                    </>
                }
            </div>

            <div className="flex items-center gap-4 mb-4">
                {menuId && <AddCategoryButton menuId={menuId} setMenu={setMenu} />}
            </div>

            {menu &&
                menu.categories.map((category, i) => (
                    <div className="mb-8" key={`category_${i}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="categoryName font-bold text-2xl">{category.name}</h3>

                            <div className="category-actions flex gap-2">
                                {menuId && 
                                <EditCategoryNameButton menuId={menuId} categoryName={category.name} setMenu={setMenu} setIsPageLoading={setIsPageLoading} />
                                }

                                {menuId && 
                                <Button className="bg-red-500 text-black p-1 rounded-sm flex flex-1 items-center justify-center hover:bg-red-600 transition-colors w-10" onClick={() => handleDeleteCategory(menuId, category.name)}>
                                    <Trash2Icon />
                                </Button>}

                            </div>

                        </div>

                        <div className={`category-${category.name}-wrapper mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
                            {menuId && category.products.map((product, j) => (
                                <ProductBox key={`${product.name}_${j}`} product={product} admin={true} menuId={menuId} categoryName={category.name} setMenu={setMenu}  />
                            ))}

                            <AddNewProductToCategory categoryName={category.name} menuId={menuId} setMenu={setMenu} />
                        </div>
                    </div>
                )                
            )}
            {isPageLoading && 
                <div className="overlay-loading fixed top-0 left-0 right-0 bottom-0 backdrop-blur-md flex items-center justify-center">
                    <Loader2Icon className="animate-spin text-black" size={64}/>
                </div>
            }
        </div>
    );
};

export default RestaurantInfo;
