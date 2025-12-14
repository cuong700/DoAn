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

      console.log(getCookie("token"));

      const fetchData = async () => {
        try {
          const res = await fetch(
            "http://localhost:8090/api/v1/users/user/detail-self",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) throw new Error("Không lấy được thông tin user");

          const data = await res.json();

          // JSON bạn gửi ở trên -> đọc role.name
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
