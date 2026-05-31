const signUpForm = document.getElementById("signUpForm");

const locationInput = document.getElementById("location");

let curLocation = {};

locationInput.addEventListener("click", async () => {

    locationInput.value = "Fetching...";

    // Ask browser for current location

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                // Reverse geocoding

                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );

                const data = await res.json();

                curLocation = {
                    area:
                        data.address.city ||
                        data.address.town ||
                        data.address.village,

                    state:
                        data.address.state,

                    postal:
                        data.address.postcode,

                    country:
                        data.address.country,

                    latitude,
                    longitude
                };

                // Show inside input

                locationInput.value =
                    `${curLocation.area}, ${curLocation.state}`;

            }
            catch (error) {
                console.error(error);
            }

        },

        // Error handler

        (error) => {

            alert(
                "Please allow location access."
            );

            console.error(error);

        }

    );

});

signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // const user = { name, email, password, location: curLocation };

        const res = await fetch("/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password, location: curLocation })
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
        console.error(error);
    }
})