/**
 * Custom hook that manages user authentication and storage in the database.
 * 
 * This hook integrates Clerk authentication with Convex backend to:
 * - Check if the user is authenticated via Clerk
 * - Store the authenticated user in the Convex database
 * - Track the user's ID once successfully stored
 * 
 * Re-renders occur when:
 * - User logs in or logs out (isAuthenticated changes)
 * - The storeUser mutation function is updated
 * - The user's ID changes (different user logs in)
 * 
 * Synchronization:
 * - Watches for authentication state changes
 * - Automatically calls the server-side storeUser mutation when user authenticates
 * - Returns loading state while user data is being synced to the database
 * - Cleans up userId state when effect unmounts
 * 
 * @returns {Object} Object containing:
 *   @returns {boolean} isLoading - True while syncing or waiting for user storage
 *   @returns {boolean} isAuthenticated - True when user is logged in and stored in DB
 */
/*
 
*/

import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useStoreUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  // When this state is set we know the server
  // has stored the user.
  const [userId, setUserId] = useState(null);
  const storeUser = useMutation(api.users.store);
  // Call the `storeUser` mutation function to store
  // the current user in the `users` table and return the `Id` value.
  useEffect(() => {
    // If the user is not logged in don't do anything
    if (!isAuthenticated) {
      return;
    }
    // Store the user in the database.
    // Recall that `storeUser` gets the user information via the `auth`
    // object on the server. You don't need to pass anything manually here.
    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }
    createUser();
    return () => setUserId(null);
    // Make sure the effect reruns if the user logs in with
    // a different identity
  }, [isAuthenticated, storeUser, user?.id]);
  // Combine the local state with the state from context
  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}