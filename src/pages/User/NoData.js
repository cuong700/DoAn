import React from "react";
import { Empty } from "antd";
import "./NoData.css";

const NoData = () => {
  return (
    <div className="no-data-container">
      <Empty
        image={Empty.PRESENTED_IMAGE_DEFAULT}
        description={<span className="no-data-text">No Data Available</span>}
      />
    </div>
  );
};

export default NoData;
