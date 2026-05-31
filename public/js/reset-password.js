const resetPasswordForm = document.getElementById("resetPasswordForm");
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    try {
        const res = await fetch("/users/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password, confirmPassword, token })
        })
        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }
        alert(data.message);
        window.location.href = "login.html";
    }
    catch (error) {
        console.log(error);
    }
})