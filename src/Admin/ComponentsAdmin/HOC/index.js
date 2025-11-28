import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../../helpers/cookie";

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
            "http://localhost:8090/api/v1/users/details",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) {
            throw new Error("Không lấy được thông tin user");
          }

          const data = await res.json();

          const roleName = data?.role?.name;

          if (roleName === "ADMIN") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsAdmin(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, []);

    useEffect(() => {
      if (!isLoading && !isAdmin) {
        navigate("/login");
      }
    }, [isLoading, isAdmin, navigate]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAdmin) {
      return null;
    }

    return <Component />;
  };
};

export default withAuth;
