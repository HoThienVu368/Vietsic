
// B1: Lấy phần tử từ HTML

const registerForm = document.getElementById("register-form")
const usernameInput = document.getElementById("username")
const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")
const confirmpasswordInput = document.getElementById("confirmpassword")

// B2: Xây dựng hàm xử lý đăng ký

async function HandleRegister()
{
    // b1: Lấy thông tin người dùng nhập vào
    const username = usernameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()
    const confirmpassword = confirmpasswordInput.value.trim()

    // b2: check xem có nhập đủ ko
    if(!username || !email || !password || !confirmpassword)
    {
        alert("Vui lòng nhập đầy đủ thông tin")
        return
    }

    // ktr mk có đúng ký tự qui định ko


    // Check mật khẩu nhập lại có đúng ko
    if(password != confirmpassword)
    {
        alert("Mật khẩu không khớp, vui lòng nhập lại")
        return


    }
    // b3: Gọi Firebase để đăng ký và bắt lỗi
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        // Lưu vào Firestore
        await db.collection("users").doc(uid).set({
            username : username,
            email : email,
            password : password,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            role_id: "user"
        });

        alert("Đăng ký thành công!");
        window.location.href = "Login.html";

    } catch (error) {
        // Đây là nơi "hứng" lỗi từ Firebase trả về để show cho người dùng
        if (error.code === 'auth/email-already-in-use') {
            alert("Email này đã được đăng ký. Vui lòng sử dụng email khác!");
        } else if (error.code === 'auth/weak-password') {
            alert("Mật khẩu quá yếu. Vui lòng nhập ít nhất 6 ký tự!");
        } else {
            alert("Lỗi: " + error.message);
        }
    }

    // b6: Chuyển qua giao diện đăng nhập
    window.location.href = "Login.html"

}


// B3: Đăng ký sự kiện
registerForm.addEventListener("submit", (event) => {
    event.preventDefault()
    HandleRegister()
})
