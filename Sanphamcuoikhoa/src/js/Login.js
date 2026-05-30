// BƯỚC 1: LẤY PHẦN TỬ
const form = document.querySelector("form")
const emailInput = document.getElementById("floatingInput")
const passwordInput = document.getElementById("floatingPassword")
const rememberCheckbox = document.getElementById("remember-me")


// BƯỚC 2: XỬ LÝ LOGIN
async function handleLogin()
{
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()
    const remember = rememberCheckbox.checked

    // check dữ liệu
    if(!email || !password)
    {
        alert("Vui lòng nhập email và mật khẩu")
        return
    }

    try
    {
        if (remember) {
            // Nếu có tích: Lưu đăng nhập mãi mãi (tắt trình duyệt bật lại vẫn còn)
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); 
        } else {
            // Nếu không tích: Chỉ lưu theo phiên (tắt tab là tự đăng xuất)
            await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION); 
        }
        // đăng nhập
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log(userCredential)

        console.log("Login success:", userCredential.user.uid)

        alert("Đăng nhập thành công")
        

        // chuyển trang
        window.location.href = "Main.html"
    }
    catch(error)
    {
        alert(error.message)
        console.error(error)
    }
}

// BƯỚC 3: EVENT SUBMIT
form.addEventListener("submit", (e) => {
    e.preventDefault()
    handleLogin()
})