import API_BASE_URL from '../../../config/api';
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  List,
  message,
  Space,
  Typography,
  Dropdown,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import UserEditComment from "./UserEditComment";

const { Title, Text } = Typography;
const { TextArea } = Input;

function ProductComment(props) {
  const { productId } = props;

  const [comments, setComments] = useState([]);
  const [contentText, setContentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [modal, contextHolder] = Modal.useModal();

  // State cho chức năng sửa
  const [editingComment, setEditingComment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const token = getCookie("token");
  const isLogin = !!token;
  const userId = getCookie("userid");

  // Kiểm tra xem user có phải admin không
  const checkAdminRole = async () => {
    if (!token || !userId) {
      setIsAdmin(false);
      return;
    }

    try {
      // Gọi API lấy danh sách tất cả user
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/admin/get-all-user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setIsAdmin(false);
        return;
      }

      const json = await response.json();
      const users = json.data || [];

      // Tìm user hiện tại trong danh sách
      const currentUser = users.find(
        (user) => user.id?.toString() === userId?.toString()
      );

      // Kiểm tra role của user
      if (currentUser && currentUser.role?.name === "ADMIN") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Check admin role error:", err);
      setIsAdmin(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/comments/public/get-all?product_id=${productId}`
      );

      if (!res.ok) throw new Error("Fetch comments failed");

      const json = await res.json();
      setComments(json.data || []);
    } catch (err) {
      console.error("Fetch comments error:", err);
      setComments([]);
    }
  };

  useEffect(() => {
    if (productId && isLogin) {
      checkAdminRole();
      fetchComments();
    } else if (productId) {
      fetchComments();
    }
  }, [productId, isLogin]);

  const handleSubmitComment = async () => {
    if (!contentText.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận!");
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/comments/user/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            content: contentText,
          }),
        }
      );

      if (!response.ok) throw new Error();

      const json = await response.json();
      setComments((prev) => [json.data, ...prev]);
      setContentText("");
      message.success("Đã gửi đánh giá");
    } catch (err) {
      console.error("Submit comment error:", err);
      message.error("Gửi bình luận thất bại!");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    modal.confirm({
      title: "Xóa bình luận",
      content: "Bạn có chắc chắn muốn xóa bình luận này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          let response;

          // Nếu là admin, gọi API admin
          if (isAdmin) {
            response = await fetch(
              `${API_BASE_URL}/api/v1/comments/admin/delete/${commentId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          } else {
            // Nếu là user thường, gọi API user
            response = await fetch(
              `${API_BASE_URL}/api/v1/comments/user/delete/${commentId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          }

          if (!response.ok) throw new Error("Delete failed");

          message.success("Đã xóa bình luận");
          setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
          );
        } catch (err) {
          console.error("Delete comment error:", err);
          message.error("Xóa bình luận thất bại");
        }
      },
    });
  };


  const handleOpenEditModal = (comment) => {
    setEditingComment(comment);
    setShowEditModal(true);
  };


  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingComment(null);
  };


  const handleUpdateSuccess = () => {
    fetchComments();
  };

  // Kiểm tra xem comment có phải của user hiện tại không
  const isCommentOwner = (comment) => {
    return comment.user?.id?.toString() === userId?.toString();
  };

  // Kiểm tra xem có nên hiển thị menu actions không
  const shouldShowActions = (comment) => {
    // Admin thấy dấu 3 chấm ở tất cả comment
    if (isAdmin) return true;

    // User thường chỉ thấy dấu 3 chấm ở comment của mình
    return isCommentOwner(comment);
  };

  // Menu items cho dropdown
  const getMenuItems = (comment) => {
    const items = [];

    // Chỉ chủ sở hữu comment mới có nút "Sửa"
    if (isCommentOwner(comment)) {
      items.push({
        key: "edit",
        label: "Sửa bình luận",
        onClick: () => handleOpenEditModal(comment),
      });
    }

    // Nút "Xóa" luôn có khi menu hiển thị
    items.push({
      key: "delete",
      label: "Xóa bình luận",
      danger: true,
      onClick: () => handleDeleteComment(comment.id),
    });

    return items;
  };

  return (
    <>
      {contextHolder}
      <div className="pd-comments-section">
        <Title level={4}>Đánh giá sản phẩm</Title>

        {isLogin ? (
          <Card className="pd-comment-form" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Text strong>Đánh giá của bạn:</Text>

              <TextArea
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={4}
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                onPressEnter={(e) => {
                  // Chỉ submit khi bấm Enter mà không giữ Shift
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />

              <Button
                type="primary"
                onClick={handleSubmitComment}
                loading={submittingComment}
                style={{ width: "150px" }}
              >
                Gửi đánh giá
              </Button>
            </Space>
          </Card>
        ) : (
          <Card style={{ marginBottom: 24, textAlign: "center" }}>
            <Text type="secondary">
              Bạn cần <Text strong>đăng nhập</Text> để viết đánh giá.
            </Text>
            <br />
            <Button
              type="primary"
              style={{ marginTop: 12 }}
              onClick={() => (window.location.href = "/login")}
            >
              Đăng nhập
            </Button>
          </Card>
        )}

        {/* Danh sách bình luận */}
        <Title level={5}>Các đánh giá ({comments.length})</Title>

        {comments.length === 0 ? (
          <div className="pd-no-comments">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={comments}
            rowKey={(item) => item.id}
            renderItem={(item) => (
              <List.Item
                actions={
                  shouldShowActions(item)
                    ? [
                        <Dropdown
                          key="more"
                          menu={{ items: getMenuItems(item) }}
                          trigger={["click"]}
                          placement="bottomRight"
                        >
                          <Button
                            type="text"
                            icon={<MoreOutlined />}
                            style={{ padding: "4px 8px" }}
                          />
                        </Dropdown>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: "gray" }}
                      icon={<UserOutlined />}
                    />
                  }
                  title={
                    <Text strong>{item.user?.fullname || "Người dùng"}</Text>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text>{item.content}</Text>
                      {item.created_at && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.created_at}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Modal sửa bình luận */}
      <UserEditComment
        visible={showEditModal}
        onClose={handleCloseEditModal}
        comment={editingComment}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </>
  );
}

export default ProductComment;
