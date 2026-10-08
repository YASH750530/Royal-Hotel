// =========================================
// ROYAL HOTEL ADMIN DASHBOARD
// JWT + MYSQL VERSION
// =========================================

const API_URL = "https://royal-hotel-h2mc.onrender.com";


// =========================================
// GET ADMIN TOKEN
// =========================================

function getAdminToken() {

    return localStorage.getItem("adminToken");

}


// =========================================
// CHECK LOGIN
// =========================================

const adminToken =
    getAdminToken();


if (!adminToken) {

    window.location.href =
        "admin-login.html";

}


// =========================================
// GET ELEMENTS
// =========================================

const bookingsContainer =
    document.getElementById("bookings-container");

const totalBookings =
    document.getElementById("total-bookings");

const totalGuests =
    document.getElementById("total-guests");

const pendingBookings =
    document.getElementById("pending-bookings");

const confirmedBookings =
    document.getElementById("confirmed-bookings");

const cancelledBookings =
    document.getElementById("cancelled-bookings");

const totalRevenue =
    document.getElementById("total-revenue");

const deluxeCount =
    document.getElementById("deluxe-count");

const premiumCount =
    document.getElementById("premium-count");

const luxuryCount =
    document.getElementById("luxury-count");

const searchBooking =
    document.getElementById("search-booking");

const roomFilter =
    document.getElementById("room-filter");

const statusFilter =
    document.getElementById("status-filter");

const clearFilters =
    document.getElementById("clear-filters");

const refreshBtn =
    document.getElementById("refresh-btn");

const logoutBtn =
    document.getElementById("logout-btn");


// =========================================
// BOOKINGS
// =========================================

let bookings = [];


// =========================================
// AUTH HEADERS
// =========================================

function getAuthHeaders() {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${getAdminToken()}`

    };

}


// =========================================
// LOAD BOOKINGS
// =========================================

async function loadBookings() {

    try {

        bookingsContainer.innerHTML = `
            <p style="
                text-align:center;
                padding:30px;
            ">
                Loading bookings...
            </p>
        `;


        const response =
            await fetch(
                `${API_URL}/api/bookings`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            logoutAdmin();

            return;

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load bookings."
            );

        }


        bookings =
            data.bookings || [];


        displayBookings();


    } catch (error) {

        console.error(
            "Load Bookings Error:",
            error
        );


        bookingsContainer.innerHTML = `
            <p style="
                text-align:center;
                padding:30px;
                color:red;
            ">
                ❌ Unable to load bookings.
            </p>
        `;

    }

}


// =========================================
// DISPLAY BOOKINGS
// =========================================

function displayBookings(
    list = bookings
) {

    bookingsContainer.innerHTML = "";


    if (
        list.length === 0
    ) {

        bookingsContainer.innerHTML = `
            <p style="
                text-align:center;
                padding:30px;
            ">
                No bookings found.
            </p>
        `;


        updateStats();

        return;

    }


    list.forEach(
        function(booking) {

            const bookingCard =
                document.createElement(
                    "div"
                );


            bookingCard.className =
                "booking-card";


            const status =
                booking.status ||
                "Pending";


            let statusClass =
                "status-pending";


            if (
                status === "Confirmed"
            ) {

                statusClass =
                    "status-confirmed";

            }


            if (
                status === "Cancelled"
            ) {

                statusClass =
                    "status-cancelled";

            }


            bookingCard.innerHTML = `

                <h3>
                    Booking #${booking.id}
                </h3>

                <p>
                    <strong>Booking ID:</strong>
                    ${booking.booking_id || "N/A"}
                </p>

                <p>
                    <strong>Name:</strong>
                    ${booking.name || "N/A"}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${booking.phone || "N/A"}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${booking.email || "N/A"}
                </p>

                <p>
                    <strong>Room:</strong>
                    ${booking.room || "N/A"}
                </p>

                <p>
                    <strong>Guests:</strong>
                    ${booking.guests || "N/A"}
                </p>

                <p>
                    <strong>Check-in:</strong>
                    ${booking.checkin || "N/A"}
                </p>

                <p>
                    <strong>Check-out:</strong>
                    ${booking.checkout || "N/A"}
                </p>

                <p>
                    <strong>Nights:</strong>
                    ${booking.nights || "N/A"}
                </p>

                <p>
                    <strong>Price / Night:</strong>
                    ₹${booking.price_per_night || "0"}
                </p>

                <p>
                    <strong>Total Amount:</strong>
                    ₹${booking.total_price || "0"}
                </p>

                <p>
                    <strong>Special Request:</strong>
                    ${booking.message || "None"}
                </p>

                <p>
                    <strong>Status:</strong>

                    <span class="${statusClass}">
                        ${status}
                    </span>

                </p>

                <button
                    onclick="confirmBooking(${booking.id})">
                    ✅ Confirm
                </button>

                <button
                    onclick="pendingBooking(${booking.id})">
                    ⏳ Pending
                </button>

                <button
                    onclick="cancelBooking(${booking.id})">
                    ❌ Cancel
                </button>

                <button
                    onclick="deleteBooking(${booking.id})">
                    🗑️ Delete
                </button>

            `;


            bookingsContainer.appendChild(
                bookingCard
            );

        }
    );


    updateStats();

}


// =========================================
// UPDATE STATS
// =========================================

function updateStats() {

    totalBookings.textContent =
        bookings.length;


    let guests = 0;

    let pending = 0;

    let confirmed = 0;

    let cancelled = 0;

    let revenue = 0;

    let deluxe = 0;

    let premium = 0;

    let luxury = 0;


    bookings.forEach(
        function(booking) {

            guests +=
                Number(
                    booking.guests
                ) || 0;


            const status =
                booking.status ||
                "Pending";


            if (
                status === "Pending"
            ) {

                pending++;

            }


            if (
                status === "Confirmed"
            ) {

                confirmed++;


                revenue +=
                    Number(
                        booking.total_price
                    ) || 0;

            }


            if (
                status === "Cancelled"
            ) {

                cancelled++;

            }


            if (
                booking.room ===
                "Deluxe Room"
            ) {

                deluxe++;

            }


            if (
                booking.room ===
                "Premium Room"
            ) {

                premium++;

            }


            if (
                booking.room ===
                "Luxury Suite"
            ) {

                luxury++;

            }

        }
    );


    totalGuests.textContent =
        guests;

    pendingBookings.textContent =
        pending;

    confirmedBookings.textContent =
        confirmed;

    cancelledBookings.textContent =
        cancelled;

    totalRevenue.textContent =
        "₹" + revenue;

    deluxeCount.textContent =
        deluxe;

    premiumCount.textContent =
        premium;

    luxuryCount.textContent =
        luxury;

}


// =========================================
// SEARCH & FILTER
// =========================================

function filterBookings() {

    const searchText =
        searchBooking.value
            .toLowerCase()
            .trim();


    const selectedRoom =
        roomFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filteredBookings =
        bookings.filter(
            function(booking) {

                const name =
                    String(
                        booking.name ||
                        ""
                    ).toLowerCase();


                const phone =
                    String(
                        booking.phone ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        booking.email ||
                        ""
                    ).toLowerCase();


                const bookingId =
                    String(
                        booking.booking_id ||
                        ""
                    ).toLowerCase();


                const matchesSearch =

                    name.includes(
                        searchText
                    )

                    ||

                    phone.includes(
                        searchText
                    )

                    ||

                    email.includes(
                        searchText
                    )

                    ||

                    bookingId.includes(
                        searchText
                    );


                const matchesRoom =

                    selectedRoom ===
                    "all"

                    ||

                    booking.room ===
                    selectedRoom;


                const currentStatus =
                    booking.status ||
                    "Pending";


                const matchesStatus =

                    selectedStatus ===
                    "all"

                    ||

                    currentStatus ===
                    selectedStatus;


                return (

                    matchesSearch &&

                    matchesRoom &&

                    matchesStatus

                );

            }
        );


    displayBookings(
        filteredBookings
    );

}


// =========================================
// FILTER EVENTS
// =========================================

searchBooking.addEventListener(
    "input",
    filterBookings
);


roomFilter.addEventListener(
    "change",
    filterBookings
);


statusFilter.addEventListener(
    "change",
    filterBookings
);


// =========================================
// CLEAR FILTERS
// =========================================

clearFilters.addEventListener(
    "click",
    function() {

        searchBooking.value = "";

        roomFilter.value =
            "all";

        statusFilter.value =
            "all";

        displayBookings();

    }
);


// =========================================
// UPDATE STATUS
// =========================================

async function updateBookingStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(

                `${API_URL}/api/bookings/${id}/status`,

                {

                    method: "PATCH",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({
                            status: status
                        })

                }

            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            logoutAdmin();

            return;

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update status."
            );

        }


        await loadBookings();


    } catch (error) {

        console.error(
            "Status Update Error:",
            error
        );


        alert(
            "❌ Unable to update booking status."
        );

    }

}


// =========================================
// CONFIRM
// =========================================

function confirmBooking(id) {

    updateBookingStatus(
        id,
        "Confirmed"
    );

}


// =========================================
// PENDING
// =========================================

function pendingBooking(id) {

    updateBookingStatus(
        id,
        "Pending"
    );

}


// =========================================
// CANCEL
// =========================================

function cancelBooking(id) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmCancel) {

        return;

    }


    updateBookingStatus(
        id,
        "Cancelled"
    );

}


// =========================================
// DELETE
// =========================================

async function deleteBooking(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to permanently delete this booking?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_URL}/api/bookings/${id}`,

                {

                    method: "DELETE",

                    headers:
                        getAuthHeaders()

                }

            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            logoutAdmin();

            return;

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to delete booking."
            );

        }


        await loadBookings();


    } catch (error) {

        console.error(
            "Delete Booking Error:",
            error
        );


        alert(
            "❌ Unable to delete booking."
        );

    }

}


// =========================================
// REFRESH
// =========================================

refreshBtn.addEventListener(
    "click",
    function() {

        loadBookings();

    }
);


// =========================================
// LOGOUT
// =========================================

function logoutAdmin() {

    localStorage.removeItem(
        "adminToken"
    );

    localStorage.removeItem(
        "adminLoggedIn"
    );

    window.location.href =
        "admin-login.html";

}


logoutBtn.addEventListener(
    "click",
    function() {

        const confirmLogout =
            confirm(
                "Do you want to logout?"
            );


        if (!confirmLogout) {

            return;

        }


        logoutAdmin();

    }
);


// =========================================
// INITIAL LOAD
// =========================================

loadBookings();