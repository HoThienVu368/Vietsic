//Kiểm tra quyền truy cập
auth.onAuthStateChanged(async (user) => {
    // Nếu chưa đăng nhập -> về login
    if (!user) {
        alert("Vui lòng đăng nhập");
        window.location.href = "Login.html";
        return;
    }

    try {
        // Đã đăng nhập -> Kiểm tra role trong Firestore
        const doc = await db.collection("users").doc(user.uid).get();
        if (!doc.exists || doc.data().role_id !== "admin") {
            alert("Bạn không có quyền truy cập trang này");
            window.location.href = "Main.html";
            return;
        }

        // Đã là Admin -> ẩn màn hình loading nếu có -> Khởi động trang admin 
        const overlay = document.getElementById("loadingOverlay");
        if (overlay) {
            overlay.style.display = "none";
        }
        
        InitSAdmin();
    } catch (error) {
        console.error("Lỗi xác thực:", error);
    }
});

// Hàm khởi tạo trang admin
function InitSAdmin() {
    // Load danh sách người dùng
    loadUsers();

    // Khởi tạo nút bấm logout
    Logout();
}

//nút logout
function Logout() {
    const btn_logout = document.getElementById("btnLogout");
    if (btn_logout) {
        btn_logout.addEventListener("click", async () => {
            if (confirm("Bạn có muốn đăng xuất trang admin?")) {
                await auth.signOut();
                window.location.href = "Login.html";
            }
        });
    }
}

// LoadUsers
function loadUsers() {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;


    db.collection("users").onSnapshot((snapshot) => {
        tbody.innerHTML = "";
        
        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Chưa có người dùng nào đăng ký</td></tr>`;
            return;
        }
        
        let index = 0;
        snapshot.forEach((doc) => {
            const id = doc.id;
            const data = doc.data();


            let maskedEmail = "Chưa có email";
            if (data.email) {
                const parts = data.email.split("@");
                if (parts[0].length > 1) {
                    maskedEmail = parts[0].charAt(0) + "..." + "@" + (parts[1] || "gmail.com");
                } else {
                    maskedEmail = data.email;
                }
            }

            tbody.innerHTML += `
            <tr>
                <td>${++index}</td>
                <td>${data.username || "Không tên"}</td>
                <td>${maskedEmail}</td>
                <td>
                    <span class="badge ${data.role_id === 'admin' ? 'bg-danger' : 'bg-secondary'}">
                        ${data.role_id || 'user'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editRole('${id}', '${data.role_id || 'user'}')">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${id}', '${data.role_id || 'user'}')">Xóa</button>
                </td>
            </tr>`;
        });
    });
}

// Hành động "sửa" chỉnh role
async function editRole(userId, currentRole) {
    const newRole = prompt("Nhập role mới (chỉ nhập 'user' hoặc 'admin'):", currentRole);
    if (newRole === null) return; 

    const roleClean = newRole.trim().toLowerCase();

    if (roleClean !== "user" && roleClean !== "admin") {
        alert("Lỗi: Role không hợp lệ! Chỉ được nhập 'user' hoặc 'admin'.");
        return;
    }

    try {
        await db.collection("users").doc(userId).update({
            role_id: roleClean
        });
        alert("Cập nhật role thành công!");
    } catch (error) {
        alert("Lỗi khi cập nhật: " + error.message);
    }
}

// Xóa tk
async function deleteUser(userId, roleId) {
    if (roleId === "admin") {
        alert("Không thể xóa tài khoản cấp quản trị (Admin)!");
        return;
    }

    if (!confirm("Bạn có chắc muốn xóa tài khoản người dùng này không?")) return;

    try {
        // Xóa thông tin người dùng trong Database (Firestore)
        await db.collection("users").doc(userId).delete();
        
        alert("✅ Đã xóa dữ liệu người dùng khỏi Database!\n\n⚠️ LƯU Ý BẢO MẬT:\nĐể xóa hoàn toàn và cho phép đăng ký lại bằng email cũ, Admin cần vào [Firebase Console -> Authentication] để xóa Email của người này (Quy định bảo mật của Firebase).");
        
    } catch (error) {
        alert("Lỗi khi xóa tài khoản: " + error.message);
    }
}