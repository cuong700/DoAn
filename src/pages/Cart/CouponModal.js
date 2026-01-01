import { useEffect, useState } from "react";
import "./CouponModal.css";

function CouponSelectorModal({
  availableCoupons,
  selectedCoupons,
  loading,
  onApplyCoupons,
  onClose,
}) {
  const [tempSelected, setTempSelected] = useState({
    global: null,
    products: {},
  });

  useEffect(() => {
    const globalCoupon = availableCoupons.valid.find(
      (c) => c.applyToAll && selectedCoupons.includes(c.code)
    );

    const productCoupons = {};
    selectedCoupons.forEach((code) => {
      const coupon = availableCoupons.valid.find(
        (c) => c.code === code && !c.applyToAll
      );
      if (coupon) {
        productCoupons[coupon.productId] = code;
      }
    });

    setTempSelected({
      global: globalCoupon?.code || null,
      products: productCoupons,
    });
  }, [selectedCoupons, availableCoupons]);

  const handleApplyCoupon = (coupon) => {
    if (coupon.applyToAll) {
      setTempSelected((prev) => ({
        ...prev,
        global: coupon.code,
      }));
    } else {
      setTempSelected((prev) => ({
        ...prev,
        products: {
          ...prev.products,
          [coupon.productId]: coupon.code,
        },
      }));
    }
  };

  const handleRemoveCoupon = (coupon) => {
    if (coupon.applyToAll) {
      setTempSelected((prev) => ({
        ...prev,
        global: null,
      }));
    } else {
      const newProducts = { ...tempSelected.products };
      delete newProducts[coupon.productId];
      setTempSelected((prev) => ({
        ...prev,
        products: newProducts,
      }));
    }
  };

  const isSelected = (coupon) => {
    if (coupon.applyToAll) {
      return tempSelected.global === coupon.code;
    }
    return tempSelected.products[coupon.productId] === coupon.code;
  };

  const canApply = (coupon) => {
    if (coupon.applyToAll) {
      return !tempSelected.global || tempSelected.global === coupon.code;
    }
    return (
      !tempSelected.products[coupon.productId] ||
      tempSelected.products[coupon.productId] === coupon.code
    );
  };

  const handleConfirm = () => {
    const couponCodes = [];

    if (tempSelected.global) {
      couponCodes.push(tempSelected.global);
    }

    Object.values(tempSelected.products).forEach((code) => {
      if (code) couponCodes.push(code);
    });

    onApplyCoupons(couponCodes);
    onClose();
  };

  const globalCoupons = availableCoupons.valid.filter((c) => c.applyToAll);
  const productCouponsMap = availableCoupons.valid
    .filter((c) => !c.applyToAll)
    .reduce((acc, coupon) => {
      const productId = coupon.productId;
      if (!acc[productId]) acc[productId] = [];
      acc[productId].push(coupon);
      return acc;
    }, {});

  return (
    <div className="coupon-modal-overlay" onClick={onClose}>
      <div
        className="coupon-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="coupon-modal-header">
          <h2>Chọn mã giảm giá</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="coupon-modal-body">
          {loading ? (
            <div className="loading">
              <p>Đang tải mã giảm giá...</p>
            </div>
          ) : (
            <>
              {globalCoupons.length > 0 && (
                <div className="coupon-section">
                  <h3>🎁 Mã giảm giá toàn đơn</h3>
                  <div className="coupon-list">
                    {globalCoupons.map((coupon) => (
                      <CouponItem
                        key={coupon.id}
                        coupon={coupon}
                        isSelected={isSelected(coupon)}
                        canApply={canApply(coupon)}
                        onApply={() => handleApplyCoupon(coupon)}
                        onRemove={() => handleRemoveCoupon(coupon)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {Object.entries(productCouponsMap).map(([productId, coupons]) => (
                <div key={productId} className="coupon-section">
                  <h3>🏷️ Mã cho: {coupons[0]?.productName}</h3>

                  <div className="coupon-list">
                    {coupons.map((coupon) => (
                      <CouponItem
                        key={coupon.id}
                        coupon={coupon}
                        isSelected={isSelected(coupon)}
                        canApply={canApply(coupon)}
                        onApply={() => handleApplyCoupon(coupon)}
                        onRemove={() => handleRemoveCoupon(coupon)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {availableCoupons.valid.length === 0 && (
                <div className="no-coupons">
                  <p>Không có mã giảm giá khả dụng cho các sản phẩm đã chọn</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="coupon-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị từng coupon item
function CouponItem({ coupon, isSelected, canApply, onApply, onRemove }) {
  return (
    <div className={`coupon-item ${isSelected ? "selected" : ""}`}>
      <div className="coupon-info">
        <div className="coupon-header-row">
          <span className="coupon-code1">{coupon.code}</span>
          <span className="coupon-type-badge">{coupon.couponType}</span>
        </div>

        <h4 className="coupon-name">{coupon.name}</h4>

        <div className="coupon-discount">💰 {coupon.description}</div>

        <div className="coupon-scope">📌 {coupon.applicableScope}</div>
      </div>

      <div className="coupon-action">
        {canApply ? (
          isSelected ? (
            <button className="btn-remove" onClick={onRemove}>
              Bỏ chọn
            </button>
          ) : (
            <button className="btn-apply" onClick={onApply}>
              Áp dụng
            </button>
          )
        ) : (
          <span className="text-disabled">Không khả dụng</span>
        )}
      </div>
    </div>
  );
}

export default CouponSelectorModal;
