const sendResetLinkForm = document.getElementById("sendResetLinkForm");

sendResetLinkForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    try {
        const res = await fetch("/users/reset-link", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })
        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }
        alert(data.message);
    }
    catch (error) {
        console.error(error);
    }
})