"use client"

import RestaurantInfo from '@/components/Dashboard/RestaurantInfo';
import { checkUserOrCreate } from '@/lib/actions/user.actions';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react'

// export const metadata: Metadata = {
//   title: "eMenu Admin",
//   description: "Your menu in the digital world",
// };
//cant change metadata in use client component

const Dashboard = () => {
  const [menuId, setMenuId] = useState(null);
  const clerkUser = useUser();

  useEffect(() => {
    const createOrGetMenu = async () => {
      if (clerkUser.isSignedIn) {
        try {
          const id = clerkUser.user?.id;
          const email = clerkUser.user?.primaryEmailAddress?.emailAddress
          const thisMenuId = await checkUserOrCreate(id, email || "");
          setMenuId(thisMenuId); // Set the menuId state when it's available
        } catch (error) {
          console.error('Error creating or retrieving menu:', error);
        }
      }
    };

    createOrGetMenu();
  }, [clerkUser]);

  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
        <h1 className='text-4xl font-bold mb-4'>
          Dashboard
        </h1>
        
        <main>
          <RestaurantInfo menuId={menuId} />
        </main>
      </div>

    </main>
  )
}

export default Dashboard