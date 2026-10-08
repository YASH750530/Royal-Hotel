// =========================
// ROYAL HOTEL - MAIN SCRIPT
// =========================


// =========================
// BACKEND API
// =========================

const API_URL = "https://royal-hotel-h2mc.onrender.com";


// =========================
// ROOM PRICES
// =========================

const roomPrices = {
    "Deluxe Room": 2500,
    "Premium Room": 4000,
    "Luxury Suite": 6000
};


// =========================
// GET ELEMENTS
// =========================

const bookingForm = document.getElementById("booking-form");
const checkinInput = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");
const roomInput = document.getElementById("room");


// =========================
// SELECT ROOM
// =========================

function selectRoom(roomName) {

    roomInput.value = roomName;

    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });

}


// =========================
// SET MINIMUM DATE
// =========================

const today =
    new Date().toISOString().split("T")[0];

checkinInput.min = today;
checkoutInput.min = today;


// =========================
// CHECK-IN CHANGE
// =========================

checkinInput.addEventListener("change", function () {

    if (checkinInput.value) {

        checkoutInput.min =
            checkinInput.value;

    }

});


// =========================
// BOOKING FORM
// =========================

bookingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // =========================
        // GET VALUES
        // =========================

        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const phone =
            document
                .getElementById("phone")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const checkin =
            checkinInput.value;

        const checkout =
            checkoutInput.value;

        const room =
            roomInput.value;

        const guests =
            document
                .getElementById("guests")
                .value;

        const message =
            document
                .getElementById("message")
                .value
                .trim();


        // =========================
        // VALIDATION
        // =========================

        if (!name) {

            alert("Please enter your name.");
            return;

        }


        if (phone.length < 10) {

            alert("Please enter a valid phone number.");
            return;

        }


        if (!email) {

            alert("Please enter your email.");
            return;

        }


        if (!checkin || !checkout) {

            alert(
                "Please select check-in and check-out dates."
            );

            return;

        }


        if (checkout <= checkin) {

            alert(
                "Check-out date must be after check-in date."
            );

            return;

        }


        if (!room) {

            alert("Please select a room.");
            return;

        }


        if (!guests || Number(guests) < 1) {

            alert("Please enter number of guests.");
            return;

        }


        // =========================
        // SHOW PROCESSING MESSAGE
        // =========================

        const bookingMessage =
            document.getElementById(
                "booking-message"
            );

        bookingMessage.innerHTML = `

            <div class="booking-receipt">

                <h3>
                    ⏳ Processing your booking...
                </h3>

                <p>
                    Please wait while we confirm
                    room availability.
                </p>

            </div>

        `;


        // =========================
        // SEND BOOKING TO BACKEND
        // =========================

        try {

            const response =
                await fetch(
                    `${API_URL}/api/bookings`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            phone: phone,

                            email: email,

                            checkin: checkin,

                            checkout: checkout,

                            room: room,

                            guests: Number(guests),

                            message: message

                        })

                    }
                );


            const data =
                await response.json();


            // =========================
            // BACKEND ERROR
            // =========================

            if (!response.ok) {

                bookingMessage.innerHTML = `

                    <div class="booking-receipt">

                        <h3>
                            ❌ Booking Failed
                        </h3>

                        <p>
                            ${data.message || "Unable to create booking."}
                        </p>

                    </div>

                `;

                return;

            }


            // =========================
            // GET SAVED BOOKING
            // =========================

            const booking =
                data.booking;


            // =========================
            // SAVE ONLY LAST RECEIPT
            // =========================

            localStorage.setItem(
                "lastBooking",
                JSON.stringify(booking)
            );


            // =========================
            // SHOW RECEIPT
            // =========================

            bookingMessage.innerHTML = `

                <div class="booking-receipt">

                    <h3>
                        ✅ Booking Submitted Successfully!
                    </h3>

                    <div class="receipt-line">
                        <strong>Booking ID:</strong>
                        <span>
                            ${booking.booking_id}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Guest:</strong>
                        <span>
                            ${booking.name}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Phone:</strong>
                        <span>
                            ${booking.phone}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Email:</strong>
                        <span>
                            ${booking.email}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Room:</strong>
                        <span>
                            ${booking.room}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Guests:</strong>
                        <span>
                            ${booking.guests}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Check-in:</strong>
                        <span>
                            ${booking.checkin}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Check-out:</strong>
                        <span>
                            ${booking.checkout}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Nights:</strong>
                        <span>
                            ${booking.nights}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Price / Night:</strong>
                        <span>
                            ₹${booking.price_per_night}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Total Amount:</strong>
                        <span>
                            ₹${booking.total_price}
                        </span>
                    </div>

                    <div class="receipt-line">
                        <strong>Status:</strong>
                        <span>
                            ${booking.status}
                        </span>
                    </div>

                    <button
                        type="button"
                        onclick="printReceipt()">

                        🖨️ Print Receipt

                    </button>

                    <button
                        type="button"
                        onclick="sendWhatsApp()">

                        📱 Send on WhatsApp

                    </button>

                </div>

            `;


            // =========================
            // RESET FORM
            // =========================

            bookingForm.reset();

            checkinInput.min = today;
            checkoutInput.min = today;


            // =========================
            // SCROLL TO RECEIPT
            // =========================

            bookingMessage.scrollIntoView({
                behavior: "smooth"
            });


        } catch (error) {

            console.error(
                "Booking API Error:",
                error
            );


            bookingMessage.innerHTML = `

                <div class="booking-receipt">

                    <h3>
                        ❌ Server Connection Failed
                    </h3>

                    <p>
                        Unable to connect to Royal Hotel server.
                        Please try again.
                    </p>

                </div>

            `;

        }

    }
);


// =========================
// PRINT RECEIPT
// =========================

function printReceipt() {

    const booking =
        JSON.parse(
            localStorage.getItem("lastBooking")
        );


    if (!booking) {

        alert("No booking receipt found.");
        return;

    }


    const printWindow =
        window.open(
            "",
            "",
            "width=700,height=700"
        );


    printWindow.document.write(`

        <html>

        <head>

            <title>
                Royal Hotel Receipt
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                }

                .receipt {
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 2px solid #c89b3c;
                }

                h1,
                h2 {
                    text-align: center;
                }

                h1 {
                    color: #c89b3c;
                }

                .line {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 10px 0;
                    border-bottom: 1px solid #ddd;
                }

                .total {
                    font-size: 20px;
                    font-weight: bold;
                }

            </style>

        </head>

        <body>

            <div class="receipt">

                <h1>
                    Royal Hotel
                </h1>

                <h2>
                    Booking Receipt
                </h2>

                <div class="line">
                    <strong>Booking ID</strong>
                    <span>
                        ${booking.booking_id}
                    </span>
                </div>

                <div class="line">
                    <strong>Guest</strong>
                    <span>
                        ${booking.name}
                    </span>
                </div>

                <div class="line">
                    <strong>Phone</strong>
                    <span>
                        ${booking.phone}
                    </span>
                </div>

                <div class="line">
                    <strong>Email</strong>
                    <span>
                        ${booking.email}
                    </span>
                </div>

                <div class="line">
                    <strong>Room</strong>
                    <span>
                        ${booking.room}
                    </span>
                </div>

                <div class="line">
                    <strong>Guests</strong>
                    <span>
                        ${booking.guests}
                    </span>
                </div>

                <div class="line">
                    <strong>Check-in</strong>
                    <span>
                        ${booking.checkin}
                    </span>
                </div>

                <div class="line">
                    <strong>Check-out</strong>
                    <span>
                        ${booking.checkout}
                    </span>
                </div>

                <div class="line">
                    <strong>Nights</strong>
                    <span>
                        ${booking.nights}
                    </span>
                </div>

                <div class="line">
                    <strong>Price / Night</strong>
                    <span>
                        ₹${booking.price_per_night}
                    </span>
                </div>

                <div class="line total">
                    <strong>Total</strong>
                    <span>
                        ₹${booking.total_price}
                    </span>
                </div>

                <div class="line">
                    <strong>Status</strong>
                    <span>
                        ${booking.status}
                    </span>
                </div>

                <p style="text-align:center;">
                    Thank you for choosing Royal Hotel.
                </p>

            </div>

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

}


// =========================
// WHATSAPP
// =========================

function sendWhatsApp() {

    const booking =
        JSON.parse(
            localStorage.getItem("lastBooking")
        );


    if (!booking) {

        alert("No booking found.");
        return;

    }


    const text =
`Hello Royal Hotel,

I want to confirm my booking.

Booking ID: ${booking.booking_id}
Name: ${booking.name}
Room: ${booking.room}
Check-in: ${booking.checkin}
Check-out: ${booking.checkout}
Nights: ${booking.nights}
Guests: ${booking.guests}
Total: ₹${booking.total_price}

Status: ${booking.status}`;


    const whatsappURL =
        "https://wa.me/?text=" +
        encodeURIComponent(text);


    window.open(
        whatsappURL,
        "_blank"
    );

}