
// Function to get a cookie
export function getCookie(cname) {
    var name = cname + "=";//Tạo chuỗi tìm kiếm
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        //Xóa khoảng trắng đầu chuỗi
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length); //Trả về giá trị cookie
        }
    }
    return "";
}

// Function to set a cookie
export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"; // Ghi cookie vào trình duyệt
}



//XÓA 1 COOKIE
export function deleteCookie(cname) {
    document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`; //Xóa cookie bằng cách đặt ngày hết hạn về quá khứ
}

//
export function deleteAllCookies() {
    const cookies = document.cookie.split(";");//Tách tất cả cookie thành mảng
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;//Lấy tên cookie
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
}
