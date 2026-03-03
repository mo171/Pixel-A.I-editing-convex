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