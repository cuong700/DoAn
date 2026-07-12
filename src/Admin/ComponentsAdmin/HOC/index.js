import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../../helpers/cookie";
import API_BASE_URL from '../../../config/api';

const withAuth = (Component) => {
  
  return function WithAuthWrapper(props) {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = getCookie("token");
      if (!token) {
        setIsLoading(false);
        setIsAdmin(false);
        return;
      }

      const fetchData = async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/v1/users/user/detail-self`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) throw new Error("Không lấy được thông tin user");

          const data = await res.json();

          const roleName = data?.role?.name;

          if (roleName === "ADMIN") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error(err);
          setIsAdmin(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, []);

    useEffect(() => {
      if (!isLoading && !isAdmin) {
        navigate("/");
      }
    }, [isLoading, isAdmin, navigate]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAdmin) return null;

    return <Component {...props} />;
  };
};

export default withAuth;
