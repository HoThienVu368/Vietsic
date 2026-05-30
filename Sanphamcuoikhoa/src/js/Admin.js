auth.onAuthStateChanged( async (user) => {
    // Nếu chưa đăng nhập -> về login
    if (!user)
    {
        alert("Vui lòng đăng nhập")
        window.location.href = "Login.html"
        return
    }

    // Đã đăng nhập -> Kiểm tra role trong Firestore
    const doc = await db.collection("users").doc(user.uid).get()
    if(!doc.exists || doc.data().role_id !== "admin")
    {
        alert("Bạn không có quyền truy cập trang này")
        window.location.href = "Main.html"
        return
    }

    // Đã là Admin -> ẩn màn hình loading -> Khởi động trang admin 
    document.getElementById("loadingOverlay").style.display = "none"
    InitAdmin()
})


// BƯỚC 2: HÀM KHỞI TẠO TRANG ADMIN
function InitAdmin()
{
    // Load sản phẩm
    loadProduct()

    // Xử lý add Form
    AddForm()

    // Nút bấm logout
    Logout()
}

function Logout()
{
    btn_logout = document.getElementById("btnLogout")

    btn_logout.addEventListener("click", async() => {
        if(confirm("Bạn có muốn đăng xuất trang admin ?"))
        {
            await auth.signOut()
            window.location.href = "Login.html"
        }
    })
}


function AddForm()
{
    const form = document.getElementById("productForm")
    const btnSubmit = form.querySelector("button[type='submit']")


    // Xử lý
    form.addEventListener("submit", async (event) => {
        event.preventDefault() // ngăn trang reload

            const namesong = document.getElementById("product_nameS").value.trim();
            const name = document.getElementById("product_name").value.trim();
            const songUrl = document.getElementById("product_songURL").value.trim();
            const imageUrl = document.getElementById("product_imageUrl").value.trim();
          
            // Sửa lỗi
        console.log(name,namesong,songUrl)

        // Xác định từng "thể loại" của bài hát được chọn
        const checkboxs = document.querySelectorAll(".music-genre-checkbox");
        let selectedGenres = [];
        checkboxs.forEach((cb) => {
            if (cb.checked) {
                selectedGenres.push(cb.value);
            }
        });

        const type = selectedGenres.join(", ");

        // Check xem có thông tin nhập vào hay không ?
        if(!name || !namesong || !songUrl || !selectedGenres.length === 0)
            {
                alert("Vui lòng điền đẩy đủ thông tin và chọn ít nhất 1 thể loại cho bài hát!")
                return;
            }


        btnSubmit.disabled = true

        // Add thông tin vào firestore
        try   
        {
            await db.collection("products").add({
                name: name,
                namesong: namesong,
                image : imageUrl,
                songUrl : songUrl,
                type: type,
                createAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            alert(`Đã thêm bài hát ${namesong} thành công !!!`)
            form.reset()
        }
        catch (error)
        {
            alert("Lỗi: " + error.message);
        }
        finally 
        {
            btnSubmit.disabled = false
        }
    })

}

function loadProduct() {
    var tbody = document.getElementById("productTableBody");

    db.collection("products")
    .orderBy("createAt", "desc")
    .onSnapshot((snapshot) => {
        tbody.innerHTML = "";
        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Chưa có sản phẩm nào</td></tr>`;
            return;
        }
        
        var index = 0;
        snapshot.forEach((doc) => {
            const id = doc.id;
            const data = doc.data();
            
            // Chuẩn hóa dữ liệu tránh lỗi hiển thị nháy đơn/nháy kép trong thuộc tính HTML
            const safeSong = (data.namesong || "").replace(/'/g, "\\'");
            const safeName = (data.name || "").replace(/'/g, "\\'");
            const safeType = (data.type || "").replace(/'/g, "\\'");

            tbody.innerHTML += `
            <tr>
              <td>${++index}</td>
              <td>${data.namesong || ""}</td>
              <td>${data.name || ""}</td>
              <td>${data.type || ""}</td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="openEditModal('${id}', '${safeSong}', '${safeName}', '${safeType}')">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${id}')">Xóa</button>
              </td>
            </tr>`;
        });
    });
}


async function deleteProduct(docID)
{
    if(!confirm("Bạn có chắc muốn xóa bài hát này không? "))
        return;

    try
    {
        await db.collection("products").doc(docID).delete();
        alert("Đã xóa bài hát thành công!");
    }
    catch (error){
        alert("Lỗi khi xóa sản phẩm: " + error.massage);
    }
}


// Modal "sửa"
function openEditModal(id, songName, artistName, genre) {
    document.getElementById("editProductId").value = id;
    document.getElementById("editSongName").value = songName;
    document.getElementById("editArtistName").value = artistName;

    // Lấy tất cả các ô checkbox trong modal Sửa dựa theo class riêng biệt
    const checkboxes = document.querySelectorAll(".edit-genre-checkbox");
    
    // Bước 1: Reset tất cả các ô về trạng thái trống (chưa tích)
    checkboxes.forEach(cb => cb.checked = false);

    // Bước 2: Nếu bài hát cũ có thể loại -> Tự động tích chọn ô đó
    if (genre) {
        checkboxes.forEach(cb => {
            // Kiểm tra xem chuỗi thể loại cũ có chứa giá trị của ô checkbox này không
            if (genre.includes(cb.value)) {
                cb.checked = true;
            }
        });
    }

    const modalElement = document.getElementById('editProductModal');
    const myModal = new bootstrap.Modal(modalElement);
    myModal.show();
}

// nút lưu thay đổi
document.addEventListener("DOMContentLoaded", () => {
    const btnSaveUpdate = document.getElementById("btnSaveUpdate");
    if (btnSaveUpdate) {
        btnSaveUpdate.addEventListener("click", async () => {
            const id = document.getElementById("editProductId").value;
            const newSongName = document.getElementById("editSongName").value.trim();
            const newArtistName = document.getElementById("editArtistName").value.trim();

            // ĐÃ SỬA: Quét chính xác các CHECKBOX đang được chọn trong modal sửa
            const checkedBoxes = document.querySelectorAll(".edit-genre-checkbox:checked");
            let selectedGenres = [];
            checkedBoxes.forEach(cb => {
                selectedGenres.push(cb.value);
            });

            // Nối mảng thành chuỗi cách nhau bằng dấu phẩy giống thầy yêu cầu
            const newGenre = selectedGenres.join(", ");

            if (!newSongName || !newArtistName || selectedGenres.length === 0) {
                alert("Vui lòng nhập đầy đủ thông tin và chọn ít nhất 1 thể loại!");
                return;
            }

            try {
                await db.collection("products").doc(id).update({
                    namesong: newSongName,
                    name: newArtistName,
                    type: newGenre
                });

                alert("Cập nhật thông tin bài hát thành công! 🎉");
                
                const modalElement = document.getElementById('editProductModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            } catch (error) {
                console.error("Lỗi cập nhật:", error);
                alert("Lỗi khi lưu: " + error.message);
            }
        });
    }
});