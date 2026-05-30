
var firebaseConfig = {
    apiKey: "AIzaSyAy7fYCGXrKfFo_66nm5cSB7Qa5ca7Wt54",
    authDomain: "vietsic.firebaseapp.com",
    projectId: "vietsic",
    storageBucket: "vietsic.firebasestorage.app",
    messagingSenderId: "688895114858",
    appId: "1:688895114858:web:84365671f4acb335dc1413"
  };
// Khởi tạo Firebase App
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

// kiểm tra quyền truy cập
auth.onAuthStateChanged(async (user) => {
    // Nếu chưa đăng nhập -> đá về trang login
    if (!user) {
        alert("Vui lòng đăng nhập!");
        window.location.href = "Login.html";
        return;
    }

    try {
        // Kiểm tra tài khoản có phải role "admin" trong bộ sưu tập "users" không
        const doc = await db.collection("users").doc(user.uid).get();
        
        if (!doc.exists || doc.data().role_id !== "admin") {
            alert("Bạn không có quyền truy cập trang này!");
            window.location.href = "Main.html";
            return;
        }

        // Nếu là Admin hợp lệ -> Ẩn màn hình loading và tải dữ liệu thống kê
        document.getElementById("loadingOverlay").style.display = "none";
        initStatistics();
        Logout();

    } catch (error) {
        console.error("Lỗi xác thực quyền Admin:", error);
        alert("Có lỗi xảy ra trong quá trình xác thực!");
    }
});


function initStatistics() {
    db.collection("products").onSnapshot((snapshot) => {
        let genreCounts = {};
        let songsArray = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Đếm thể loại
            if (data.type) {
                data.type.split(',').forEach(g => {
                    let genre = g.trim();
                    if(genre) genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                });
            }

            // Thu thập bài hát
            songsArray.push({
                name: data.namesong,
                artist: data.name,
                listens: data.listens || 0
            });
        });

        // Đổ dữ liệu ra các khung chứa trên HTML
        renderGenres(genreCounts);
        renderSongs(songsArray);
    });
}

function renderGenres(genreCounts) {
    let sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    let html = sorted.map((item, i) => `
        <div class="mb-3">
            <div class="d-flex justify-content-between"><span>#${i+1} ${item[0]}</span><span class="text-warning">${item[1]} bài</span></div>
            <div class="progress" style="height: 6px;"><div class="progress-bar bg-warning" style="width: ${(item[1]/sorted[0][1])*100}%"></div></div>
        </div>
    `).join('');
    document.getElementById("top-genres-container").innerHTML = html || "Chưa có dữ liệu";
}

function renderSongs(songs) {
    let sorted = songs.sort((a, b) => b.listens - a.listens).slice(0, 5);
    let html = sorted.map((s, i) => `
        <div class="mb-3">
            <div class="d-flex justify-content-between">
                <span class="text-truncate" style="max-width: 70%">#${i+1} ${s.name}</span>
                <span class="text-info">${s.listens} nghe</span>
            </div>
            <div class="progress" style="height: 6px;"><div class="progress-bar bg-info" style="width: ${(s.listens/(sorted[0].listens||1))*100}%"></div></div>
        </div>
    `).join('');
    document.getElementById("top-songs-container").innerHTML = html || "Chưa có dữ liệu";
}


// nút logout
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