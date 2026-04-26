import { setAppliedInternships } from "@/redux/internshipSlice";
import { INTERNSHIP_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAppliedInternships = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAppliedInternships = async () => {
            try {
                const res = await axios.get(`${INTERNSHIP_API_END_POINT}/applied`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAppliedInternships(res.data.applications || []));
                }
            } catch (error) {
                console.log("Failed to fetch applied internships:", error?.response?.data?.message || error.message);
                dispatch(setAppliedInternships([]));
            }
        };
        fetchAppliedInternships();
    }, [dispatch]);
};

export default useGetAppliedInternships;
