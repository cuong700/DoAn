import { FileExcelOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";

function ExcelAnalytics() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async (start, end) => {
    try {
      setExporting(true);

      const token = getCookie("token");

      const query = new URLSearchParams();
      if (start) query.append("start", start);
      if (end) query.append("end", end);

      const res = await fetch(
        `http://localhost:8090/api/v1/orders/admin/revenue/products/export?${query.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (!res.ok) throw new Error("Xuất excel thất bại");

      // nhận file nhị phân từ BE
      const blob = await res.blob();

      // tạo link download tạm thời
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "doanh-thu.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();//xoá thẻ a sau khi click
      window.URL.revokeObjectURL(url); //Giải phóng URL tạm để tránh tốn bộ nhớ.

      message.success("Xuất Excel thành công");
    } catch (error) {
      console.error(error);
      message.error("Xuất Excel thất bại, vui lòng thử lại!");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<FileExcelOutlined />}
        onClick={handleExportExcel}
        loading={exporting}
      >
        Xuất Excel
      </Button>
    </>
  );
}

export default ExcelAnalytics;
