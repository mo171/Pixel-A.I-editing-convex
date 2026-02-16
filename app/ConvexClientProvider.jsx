"use client";

import { ConvexReactClient, ConvexProviderWithClerk } from "convex/react";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }) {
    const auth = useAuth();
    return (
    <ConvexProviderWithClerk
      client={convex}
      useAuth={auth}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}