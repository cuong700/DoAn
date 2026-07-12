import { useState } from "react";
import { Button, Modal, Upload, message, Alert } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { getCookie } from "../../../helpers/cookie";
import API_BASE_URL from '../../../config/api';

const { Dragger } = Upload;

function ImportProduct(props) {
  const { onReload } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const [importResult, setImportResult] = useState(null);

  const token = getCookie("token");

  const handleOpen = () => {
    setOpen(true);
    setFileList([]);
    setImportResult(null);
  };

  const handleClose = () => {
    setOpen(false);
    setFileList([]);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error("Vui lòng chọn file Excel để import!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", fileList[0]);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/products/admin/uploads/excel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      // Kiểm tra Content-Type để xử lý đúng format
      const contentType = res.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // Server trả về text thuần, chuyển thành object
        const text = await res.text();
        data = {
          message: text,
          errors: []
        };
      }

      if (res.ok) {
        setImportResult({
          type: "success",
          message: data.message || "Import thành công!",
          errors: data.errors || [],
        });

        message.success("Import sản phẩm thành công!");

        // Reload lại danh sách sau 1.5s
        setTimeout(() => {
          onReload();
          handleClose();
        }, 1500);
      } else {
        setImportResult({
          type: "error",
          message: data.message || "Import thất bại!",
          errors: data.errors || [],
        });
        message.error("Import thất bại!");
      }
    } catch (error) {
      console.error("Error importing products:", error);
      message.error("Có lỗi xảy ra khi import sản phẩm!");
      setImportResult({
        type: "error",
        message: "Có lỗi xảy ra khi import sản phẩm!",
        errors: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    accept: ".xlsx,.xls",
    maxCount: 1,  
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        message.error("Chỉ được upload file Excel (.xlsx, .xls)!");
        return false;
      }

      const isLt200M = file.size / 1024 / 1024 < 200;
      if (!isLt200M) {
        message.error("File phải nhỏ hơn 200MB!");
        return false;
      }

      setFileList([file]);
      return false; // Không upload tự động
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
  };

  return (
    <>
      <Button
        type="default"
        icon={<UploadOutlined />}
        onClick={handleOpen}
        style={{ marginLeft: 8 }}
      >
        Import Excel
      </Button>

      <Modal
        title="Import danh sách sản phẩm"
        open={open}
        onCancel={handleClose}
        onOk={handleImport}
        okText="Import"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
        okButtonProps={{
          disabled: fileList.length === 0,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="Lưu ý"
            description={
              <div>
                <p>• File phải có định dạng Excel (.xlsx hoặc .xls)</p>
                <p>• Kích thước file tối đa: 200MB</p>
                <p>• Vui lòng đảm bảo dữ liệu trong file đúng định dạng</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </div>

        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: "#1890ff" }} />
          </p>
          <p className="ant-upload-text">
            Nhấp hoặc kéo file Excel vào đây để tải lên
          </p>
          <p className="ant-upload-hint">
            Hỗ trợ file .xlsx và .xls (tối đa 200MB)
          </p>
        </Dragger>

        {importResult && (
          <div style={{ marginTop: 16 }}>
            <Alert
              message={importResult.message}
              type={importResult.type}
              showIcon
              description={
                importResult.errors.length > 0 && (
                  <div style={{ maxHeight: 200, overflow: "auto" }}>
                    <p style={{ fontWeight: "bold", marginBottom: 8 }}>
                      Chi tiết lỗi:
                    </p>
                    {importResult.errors.map((error, index) => (
                      <p key={index} style={{ margin: "4px 0" }}>
                        • {error}
                      </p>
                    ))}
                  </div>
                )
              }
            />
          </div>
        )}
      </Modal>
    </>
  );
}

export default ImportProduct;