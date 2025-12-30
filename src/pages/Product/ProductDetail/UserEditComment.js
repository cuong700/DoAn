import { Button, Input, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";

const { TextArea } = Input;

function UserEditComment(props) {
  const { 
    visible, 
    onClose, 
    comment, 
    onUpdateSuccess 
  } = props;

  const [editContent, setEditContent] = useState(comment?.content || "");
  const [loading, setLoading] = useState(false);

  const token = getCookie("token");

  
  useEffect(() => {
    if (comment) {
      setEditContent(comment.content);
    }
  }, [comment]);

  const handleUpdateComment = async () => {
    if (!editContent.trim()) {
      message.warning("Nội dung bình luận không được để trống!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/comments/user/update/${comment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: editContent,
          }),
        }
      );

      if (response.ok) {
        message.success("Cập nhật bình luận thành công!");
        onUpdateSuccess(); // Callback để refresh danh sách comments
        onClose(); // Đóng modal
      } else {
        throw new Error("Không thể cập nhật bình luận");
      }
    } catch (err) {
      console.error("Update comment error:", err);
      message.error("Cập nhật bình luận thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditContent(comment?.content || "");
    onClose();
  };

  return (
    <Modal
      title="Sửa bình luận"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleUpdateComment}
        >
          Cập nhật
        </Button>,
      ]}
    >
      <TextArea
        placeholder="Nhập nội dung bình luận mới..."
        rows={4}
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        onPressEnter={(e) => {
          if(!e.shiftKey){
            e.preventDefault();
            handleUpdateComment();
          }
        }}
      />
    </Modal>
  );
}

export default UserEditComment;