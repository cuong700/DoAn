import { useRoutes } from "react-router-dom";
import { routes } from "../../Router";

function Allroutes() {
  const elements = useRoutes(routes);

  return <div>{elements}</div>;
}

export default Allroutes;
