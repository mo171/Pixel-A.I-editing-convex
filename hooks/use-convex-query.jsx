
/**
 * This hook wraps Convex's useQuery hook and provides additional state management.
 
 * **Execution Flow:**
 * 1. Calls useQuery(query, ...args) immediately to fetch data from Convex backend
 * 2. Initializes local state: data (undefined), isLoading (true), error (null)
 * 3. Sets up useEffect that runs whenever the query result changes
 
 * **When result changes (useEffect dependency):**
 * - If result is undefined: Sets loading to true and clears errors (query pending)
 * - If result has value: Sets data to result, loading to false, attempts to catch errors
 * - If error occurs during state update: Catches error and sets error state
 
 * **Cleanup:**
 * - useEffect automatically cleans up on component unmount (no explicit cleanup needed)
 * - Dependencies array [result] ensures effect runs only when query result changes
 * 
 * **Example Usage:**
 * ```jsx
 * const { data: project, isLoading, error } = useConvexQuery(api.projects.getProject, projectId);
 * ```
 
 * for mutation
 *  * ```jsx
 * const { data, isLoading, error, mutate } = useConvexMutation(api.projects.updateProject);
 * await mutate(projectId, { name: "New Name" });
 * the first param(projectId) is the argument for the mutation function, and the second param is the object to update
 * ```
 
 */

import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


export const useConvexQuery = (query, ...args) => {
    const result = useQuery(query, ...args);// query is url and arg is the object to fetch
    // example:
    // const { data: project, isLoading, error } = useConvexQuery(api.projects.getProject, projectId);
    const [data, setData] = useState(undefined)
    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    useEffect(() => {
        if (result === undefined) {
            setLoading(true)
            setError(null)
        }else {
            try {
                setData(result)
                setLoading(false)
            }catch (err) {                
                setError(err)
                setLoading(false)
            }
        }
    }, [result])
 
    return { data, isLoading, error }
}

export const useConvexMutation = (mutation) => {
    const mutationFn = useMutation(mutation);

    const [data, setData] = useState(undefined)
    const [isLoading, setLoading] = useState(null)
    const [error, setError] = useState(null)
    
    const mutate = async(...args) => {
        setLoading(true)
        setError(null)

        try {
            const result = await mutationFn(...args)
            // setLoading(false)
            setData(result)
           
            return result
        }catch (err) {
            setError(err)
            toast.error(err.message || "An error occurred")
        
        }finally {
            setLoading(false)
        }
    }
 
    return { data, isLoading, error, mutate }
}