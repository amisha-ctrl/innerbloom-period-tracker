const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
    const token = await localStorage.getItem("token");

    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const userLocation = document.getElementById("userLocation");

    try {
        const res = await fetch("/users/profile", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            }
        })
        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }
        const formattedName = data.user.name
            .split(" ")
            .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");

        userName.innerText = formattedName;
        userEmail.innerText = data.user.email;
        userLocation.innerText = `${data.user.location.area}, ${data.user.location.state}, ${data.user.location.country}`;
    }
    catch (error) {
        console.error(error);
    }
})

async function logOut() {
    try {
        if (token) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        }
    }
    catch (error) {
        console.error(error);
    }
}

async function deleteUser() {
    try {
        const isConfirmed = confirm("Are you sure, you want to Delete Account?\nThis Process cannot be Undone.");
        if (isConfirmed) {
            const res = await fetch("/users/delete-account", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                }
            })
            const data = await res.json();
            if (!res.ok) {
                alert(data.message);
                return;
            }
            alert(data.message);
            localStorage.removeItem("token");
            window.location.href = "signup.html";
        }
        else {
            return;
        }
    }
    catch (error) {
        console.error(error);
    }
}

async function editInfo() {
    try {
        const userName = document.getElementById("userName");
        const userEmail = document.getElementById("userEmail");

        const newName = prompt("Update Name", userName.innerText);
        const newEmail = prompt("Update Email Id", userEmail.innerText);

        if (!newName || !newEmail) {
            return;
        }

        const res = await fetch("/users/update-info", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ name: newName, email: newEmail })
        })
        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }

        userName.innerText = newName;
        userEmail.innerText = newEmail;

        alert(data.message);
    }
    catch (error) {
        console.error(error);
    }
}

async function refreshLocation() {

    try {

        const userLocation = document.getElementById("userLocation");

        userLocation.innerText = "Fetching...";

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    // Reverse Geocoding

                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    const geoData =
                        await geoRes.json();

                    const curLocation = {

                        area:
                            geoData.address.city ||
                            geoData.address.town ||
                            geoData.address.village,

                        state:
                            geoData.address.state,

                        postal:
                            geoData.address.postcode,

                        country:
                            geoData.address.country,

                        latitude,
                        longitude

                    };

                    // Update backend

                    const res = await fetch(
                        "/users/new-location",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    "Bearer " + token
                            },

                            body: JSON.stringify({
                                location: curLocation
                            })
                        }
                    );

                    const data =
                        await res.json();

                    if (!res.ok) {

                        alert(data.message);
                        return;

                    }

                    // Update UI

                    const location = data.user.location;

                    if (location) {
                        userLocation.innerText =
                            `${location.area || "Unknown Area"}, 
                            ${location.state || "Unknown State"}, 
                            ${location.country || "Unknown Country"}`;
                    } else {
                        userLocation.innerText = "Location not available";
                    }

                    alert(data.message);

                }
                catch (error) {

                    console.error(error);

                }

            },

            (error) => {

                alert(
                    "Please allow location access."
                );

                console.error(error);

            }

        );

    }
    catch (error) {

        console.error(error);

    }

}


const modal = document.getElementById("periodModal");
const openBtn = document.getElementById("logPeriodBtn");
const closeBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const periodForm = document.getElementById("periodForm");


// Open modal
openBtn.addEventListener("click", () => {
    modal.classList.add("active");
});

// Close modal
closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
});

cancelBtn.addEventListener("click", () => {
    modal.classList.remove("active");
});

// Close when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});

periodForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const flowIntensity = document.getElementById("flowIntensity").value;
    const symptoms = [];
    document.querySelectorAll('input[name="symptoms"]:checked').forEach((checkbox) => {
        symptoms.push(checkbox.value);
    });
    const notes = document.getElementById("notes").value;

    const periodData = { startDate, endDate, flowIntensity, symptoms, notes }

    try {
        const res = await fetch("/users/period/periodEntry", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify(periodData)
        })
        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }
        alert(data.message);
    }
    catch (error) {
        console.log(error);
    }
})

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/users/period/dashboard", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            }
        })
        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }

        const averageCycleLength = document.getElementById("averageCycleLength").textContent = data.averageCycleLength;
        const averagePeriodLength = document.getElementById("averagePeriodLength").textContent = data.averagePeriodLength;
        const totalCycle = document.getElementById("totalCycles").textContent = data.totalCycles;
        const longestCycle = document.getElementById("longestCycle").textContent = data.longestCycle;

        const historyContainer = document.getElementById("history");

        if (!data.history || data.history.length === 0) {
            historyContainer.innerHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Flow</th>
                    <th>Period Length</th>
                    <th>Cycle Length</th>
                    <th>Symptoms</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="7" style="text-align:center;">
                        No history available
                    </td>
                </tr>
            </tbody>
        </table>
    `;
        }
        else {
            historyContainer.innerHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Flow</th>
                    <th>Period Length</th>
                    <th>Cycle Length</th>
                    <th>Symptoms</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody id="historyTableBody"></tbody>
        </table>
    `;
            const tableBody = document.getElementById("historyTableBody");
            data.history.forEach((entry) => {
                tableBody.innerHTML += `
            <tr>
                <td>
                    ${new Date(entry.startDate).toLocaleDateString("en-GB")}
                </td>
                <td>
                    ${new Date(entry.endDate).toLocaleDateString("en-GB")}
                </td>
                <td>
                    ${entry.flowIntensity}
                </td>
                <td>
                    ${entry.periodLength} days
                </td>
                <td>
                    ${entry.cycleLength || "--"} days
                </td>
                <td>
                    ${entry.symptoms.join(", ")}
                </td>
                <td>
                    ${entry.notes}
                </td>
            </tr>`;
            });
        }

        const viewAllBtn = document.getElementById("viewAllBtn");
        const calendarModal = document.getElementById("calendarModal");
        const closeCalendarBtn = document.getElementById("closeCalendarBtn");

        let calendar;

        viewAllBtn.addEventListener("click", async () => {
            calendarModal.classList.add("active");
            try {
                const res = await fetch(
                    "/users/period/dashboard",
                    {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    }
                );
                const data = await res.json();
                const events = [];
                data.history.forEach((entry) => {
                    // Period days
                    events.push({
                        title: "Period",
                        start: entry.startDate,
                        end: new Date(
                            new Date(entry.endDate)
                                .setDate(
                                    new Date(entry.endDate).getDate() + 1
                                )
                        ),
                        color: "#ff4f87"
                    });
                    // Predicted next period
                    if (entry.predictedNextPeriod) {
                        events.push({
                            title: "Predicted Period",
                            start: entry.predictedNextPeriod,
                            color: "#ffb3c7"
                        });
                    }
                });
                const calendarEl =
                    document.getElementById("calendar");
                if (calendar) {
                    calendar.destroy();
                }
                calendar = new FullCalendar.Calendar(
                    calendarEl,
                    {
                        initialView: "dayGridMonth",
                        height: 650,
                        events: events
                    }
                );
                calendar.render();
            }
            catch (error) {
                console.log(error);
            }
        });
        closeCalendarBtn.addEventListener("click", () => {
            calendarModal.classList.remove("active");
        });
    }
    catch (error) {
        console.log(error);
    }
})
