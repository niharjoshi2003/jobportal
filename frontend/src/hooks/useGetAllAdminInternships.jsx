import { setAllAdminInternships } from "@/redux/internshipSlice";
import { INTERNSHIP_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllAdminInternships = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${INTERNSHIP_API_END_POINT}/admin`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllAdminInternships(res.data.internships || []));
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetch();
    }, [dispatch]);
};

export default useGetAllAdminInternships;
