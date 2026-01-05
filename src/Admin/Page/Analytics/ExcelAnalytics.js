import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { getCookie } from "../../../helpers/cookie";
import { useState } from "react";

function ExcelAnalytics({ startMonth = null, endMonth = null }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      const params = new URLSearchParams();
      if (startMonth) {
        params.append("start", startMonth);
      }
      if (endMonth) {
        params.append("end", endMonth);
      }

      const response = await fetch(
        `http://localhost:8090/api/v1/orders/admin/revenue/products/export?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Không thể xuất file Excel");
      }

      // Tạo blob từ response
      const blob = await response.blob();

      // Tạo URL tạm thời và trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Tạo tên file theo khoảng thời gian
      let fileName = "DoanhThu";
      if (startMonth && endMonth) {
        fileName = `DoanhThu_${startMonth}_to_${endMonth}.xlsx`;
      } else {
        fileName = `DoanhThu_all_time.xlsx`;
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Lỗi khi xuất file Excel: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={handleExport}
      loading={loading}
    >
      Xuất Excel
    </Button>
  );
}

export default ExcelAnalytics;