import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { MenuType } from "@/types/types";
import { getRandomMenus } from "@/lib/actions/menu.actions";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

const ClientsCarousel = () => {
    const [menus, setMenus] = useState<MenuType[]>([]);
    const [loading, setLoading] = useState(true);

    const getMenus = async () => {
        try {
            const menusResponse = await getRandomMenus(5);
            const menusTripled = menusResponse.concat(menusResponse, menusResponse);
            setMenus(menusTripled);
        } catch (err) {
            console.log("Error getting menus:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMenus();
    }, []);

    return (
        <section className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
            <h3 className="font-medium mb-4 text-xl">Check out some of our clients:</h3>
            <Carousel
                className="w-full"
                plugins={[
                    Autoplay({
                        delay: 4000,
                        loop: true,
                        stopOnInteraction: true,
                    }),
                ]}
            >
                <CarouselContent>
                    {loading
                        ? Array.from({ length: 4 }).map((_, index) => (
                              <CarouselItem key={index} className="basis-1 sm:basis-1/2 md:basis-1/4">
                                  <div className="p-1">
                                      <Card>
                                          <CardContent className="flex aspect-square items-center justify-center p-6">
                                              <Skeleton className="h-full w-full" />
                                          </CardContent>
                                      </Card>
                                  </div>
                              </CarouselItem>
                          ))
                        : menus.map((menu) => (
                              <CarouselItem key={menu._id} className="basis-1 sm:basis-1/2 md:basis-1/4">
                                  <div className="p-1">
                                      <Card>
                                          <CardContent className="flex flex-col items-center p-6">
                                              <Image
                                                  src={menu.menuPreviewImage || "/dashboard-cover.webp"}
                                                  alt={`Preview for ${menu.restaurantName}`}
                                                  className="w-full h-40 object-cover mb-4 rounded-md"
                                                  width={1600}
                                                  height={900}
                                              />
                                              <h3 className="text-xl font-semibold">{menu.restaurantName}</h3>
                                          </CardContent>
                                      </Card>
                                  </div>
                              </CarouselItem>
                          ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </section>
    );
};

export default ClientsCarousel;
