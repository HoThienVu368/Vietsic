// Kiểm tra Session + cập nhật thanh Navbar
auth.onAuthStateChanged(async (user) => {

    const loginItem = document.getElementById("login-item")
    const registerItem = document.getElementById("register-item")
    const logoutItem = document.getElementById("logout-item")
    const navUsername = document.getElementById("nav-username")

    if (user) {
        // Đã đăng nhập: ẩn Login + Register, Hiện Logout + tên User
        loginItem.classList.add("d-none")
        registerItem.classList.add("d-none")
        logoutItem.classList.remove("d-none")

        try {
            const doc = await db.collection("users").doc(user.uid).get()
            if (doc.exists) {
                navUsername.textContent = " " + doc.data().username
            }
        }
        catch (error) {
            console.error(error)
        }
    }
    else {
        // Chưa đăng nhập: hiện Login + Register, ẩn Logout + tên User
        loginItem.classList.remove("d-none")
        registerItem.classList.remove("d-none")
        logoutItem.classList.add("d-none")  
        navUsername.textContent = ""
    }

})

// HÀM LẤY TOÀN BỘ NHẠC VÀ HIỂN THỊ RA GIAO DIỆN MORE
function loadMoreNewMusicCards() {
    const musicContainer = document.getElementById("all-music-container");
    if (!musicContainer) return; // Nếu không ở trang More thì bỏ qua

    // Lấy toàn bộ bài hát từ Firestore
    db.collection("products")
      .orderBy("createAt", "desc")
      .onSnapshot((snapshot) => {
          musicContainer.innerHTML = ""; // Xóa dữ liệu cũ đi trước khi đổ mới

          if (snapshot.empty) {
              musicContainer.innerHTML = `<p class="text-muted text-center w-100">Chưa có bài hát nào</p>`;
              return;
          }

          // Duyệt qua từng bài hát lấy được từ Firebase
          snapshot.forEach((doc) => {
            const data = doc.data();
        
            let displayType = "Chưa cập nhật";
            if (data.type) {
                const genresArray = data.type.split(',').map(item => item.trim());
                
                if (genresArray.length > 3) {
                    displayType = genresArray.slice(0, 3).join(', ') + ', ...';
                } else {
                    displayType = genresArray.join(', ');
                }
            }
        
            //Kiểm tra xem hình ảnh có bị lỗi hay không
            let songImg = "src/image/placeholder.png";
            if (data.image && data.image.trim() !== "" && data.image !== "null" && data.image !== "undefined") {
                songImg = data.image;
            }
        
            // Tạo Card giao diện cho từng bài hát (Dùng col-2 để chia 6 cột/hàng)
            musicContainer.innerHTML += `
              <div class="col-12 col-sm-6 col-md-4 col-lg-2 mb-4">
                  <div class="card text-bg-dark h-100 shadow" style="border: 1px solid #444;">
                      
                      <img src="${songImg}" 
                           onerror="this.onerror=null; this.src='src/image/placeholder.png';" 
                           class="card-img-top" 
                           alt="Cover" 
                           style="height: 155px; object-fit: cover;">
                           
                      <div class="card-body p-2 d-flex flex-column">
                          <h6 class="card-title mb-1 text-truncate" title="${data.namesong}">${data.namesong}</h6>
                          <p class="card-text text-muted mb-2" style="font-size: 0.85rem;">${data.name}</p>
                          <div class="mt-auto">
                              <span class="badge text-bg-secondary mb-2 w-100 text-truncate" data-bs-toggle="tooltip" data-bs-placement="top" title="${data.type}">Thể Loại: ${displayType}</span>
                              <button onclick="playSong('${doc.id}', '${data.songUrl}')" class="btn btn-primary btn-sm w-100">Nghe</button>
                          </div>
                      </div>
                  </div>
              </div>`;
        });

        // show hết thể loại khi dò chuột vào
          const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
          const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      });
}

// Thêm hàm xử lý sự kiện click cho nút "Nghe"
async function playSong(songId, songUrl) {
    // 1. Mở tab chứa link nhạc
    window.open(songUrl, '_blank');

    // 2. Cộng thêm 1 lượt nghe lên Firebase
    try {
        await db.collection("products").doc(songId).update({
            listens: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error("Lỗi cập nhật lượt nghe:", error);
    }
}

// Gọi hàm này để nó chạy ngay khi mở trang
loadMoreNewMusicCards();