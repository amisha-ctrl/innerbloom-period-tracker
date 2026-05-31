const loginForm = document.getElementById("loginForm");
const forgotPassword = document.getElementById("forgotPassword");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const user = { email, password };

        const res = await fetch("/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }
        localStorage.setItem("token", data.token);
        alert(data.message);
        window.location.href = "dashboard.html";
    }
    catch (error) {
        console.error(error.message);
    }
})

forgotPassword.addEventListener("click",  () => {
    window.location.href = "forgotPassword.html";
})