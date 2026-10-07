const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


// =========================================
// ROOM PRICES
// =========================================

const roomPrices = {
    "Deluxe Room": 2500,
    "Premium Room": 4000,
    "Luxury Suite": 6000
};


// =========================================
// MYSQL CONNECTION
// =========================================

const db = mysql.createPool({

    host: process.env.DB_HOST || "localhost",

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "royal_hotel",

    port: Number(process.env.DB_PORT) || 3306,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// =========================================
// TEST DATABASE CONNECTION
// =========================================

async function testDatabaseConnection() {

    try {

        const connection =
            await db.getConnection();

        console.log(
            "✅ MySQL connected successfully"
        );

        connection.release();

    } catch (error) {

        console.error(
            "❌ MySQL connection failed:"
        );

        console.error(
            error.message
        );

    }

}


// =========================================
// HOME ROUTE
// =========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Royal Hotel Backend is running!"

    });

});


// =========================================
// BOOKING API TEST
// =========================================

app.get(
    "/api/bookings/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Booking API is working!"

        });

    }
);


// =========================================
// ADMIN LOGIN
// =========================================

app.post(
    "/api/admin/login",
    async (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;


            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required."

                });

            }


            const adminUsername =
                "admin";


            const hashedPassword =
                process.env.ADMIN_PASSWORD_HASH;


            if (
                username !== adminUsername ||
                !hashedPassword
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password."

                });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    hashedPassword
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password."

                });

            }


            const token =
                jwt.sign(

                    {
                        username:
                            adminUsername,

                        role:
                            "admin"
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn:
                            "2h"
                    }

                );


            res.json({

                success: true,

                message:
                    "Login successful!",

                token:
                    token

            });


        } catch (error) {

            console.error(
                "❌ Admin Login Error:"
            );

            console.error(
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Login failed."

            });

        }

    }
);


// =========================================
// JWT ADMIN AUTHENTICATION
// =========================================

function verifyAdminToken(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    if (
        !authHeader ||
        !authHeader.startsWith(
            "Bearer "
        )
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Admin authentication required."

        });

    }


    const token =
        authHeader.split(" ")[1];


    try {

        const decoded =
            jwt.verify(

                token,

                process.env.JWT_SECRET

            );


        if (
            decoded.role !== "admin"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Admin access required."

            });

        }


        req.admin =
            decoded;


        next();


    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired admin token."

        });

    }

}


// =========================================
// CREATE BOOKING
// PUBLIC ROUTE
// =========================================

app.post(
    "/api/bookings",
    async (req, res) => {

        try {

            const {

                name,

                phone,

                email,

                checkin,

                checkout,

                room,

                guests,

                message

            } = req.body;


            // =========================================
            // REQUIRED FIELDS
            // =========================================

            if (

                !name ||

                !phone ||

                !email ||

                !checkin ||

                !checkout ||

                !room ||

                !guests

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please fill all required booking details."

                });

            }


            // =========================================
            // ROOM VALIDATION
            // =========================================

            if (
                !roomPrices[room]
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid room selected."

                });

            }


            // =========================================
            // GUEST VALIDATION
            // =========================================

            const guestCount =
                Number(guests);


            if (

                !Number.isInteger(
                    guestCount
                ) ||

                guestCount <= 0

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid number of guests."

                });

            }


            // =========================================
            // DATE VALIDATION
            // =========================================

            const startDate =
                new Date(checkin);

            const endDate =
                new Date(checkout);


            if (

                isNaN(
                    startDate.getTime()
                ) ||

                isNaN(
                    endDate.getTime()
                )

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking dates."

                });

            }


            if (
                endDate <= startDate
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Check-out date must be after check-in date."

                });

            }


            // =========================================
            // CALCULATE NIGHTS
            // =========================================

            const difference =
                endDate - startDate;


            const nights =
                Math.ceil(

                    difference /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )

                );


            // =========================================
            // PRICE
            // =========================================

            const pricePerNight =
                roomPrices[room];


            const totalPrice =
                nights *
                pricePerNight;


            // =========================================
            // CHECK ROOM AVAILABILITY
            // =========================================

            const [
                existingBookings
            ] =
                await db.execute(

                    `SELECT id
                     FROM bookings
                     WHERE room = ?
                     AND status <> 'Cancelled'
                     AND checkin < ?
                     AND checkout > ?
                     LIMIT 1`,

                    [
                        room,
                        checkout,
                        checkin
                    ]

                );


            if (
                existingBookings.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Sorry! This room is already booked for the selected dates."

                });

            }


            // =========================================
            // GENERATE BOOKING ID
            // =========================================

            const randomNumber =
                Math.floor(
                    1000 +
                    Math.random() *
                    9000
                );


            const bookingId =
                `RH-${Date.now()}-${randomNumber}`;


            // =========================================
            // INSERT BOOKING
            // =========================================

            const [
                result
            ] =
                await db.execute(

                    `INSERT INTO bookings
                    (
                        booking_id,
                        name,
                        phone,
                        email,
                        checkin,
                        checkout,
                        room,
                        guests,
                        message,
                        nights,
                        price_per_night,
                        total_price,
                        status,
                        payment_status
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                    [

                        bookingId,

                        name.trim(),

                        phone.trim(),

                        email.trim(),

                        checkin,

                        checkout,

                        room,

                        guestCount,

                        message
                            ? message.trim()
                            : "",

                        nights,

                        pricePerNight,

                        totalPrice,

                        "Pending",

                        "Pending"

                    ]

                );


            // =========================================
            // GET CREATED BOOKING
            // =========================================

            const [
                rows
            ] =
                await db.execute(

                    `SELECT *
                     FROM bookings
                     WHERE id = ?`,

                    [
                        result.insertId
                    ]

                );


            // =========================================
            // RESPONSE
            // =========================================

            res.status(201).json({

                success: true,

                message:
                    "Booking created successfully!",

                booking:
                    rows[0]

            });


        } catch (error) {

            console.error(
                "❌ Booking Error:"
            );

            console.error(
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Booking failed."

            });

        }

    }
);


// =========================================
// GET ALL BOOKINGS
// PROTECTED ADMIN ROUTE
// =========================================

app.get(
    "/api/bookings",
    verifyAdminToken,
    async (req, res) => {

        try {

            const [
                bookings
            ] =
                await db.execute(

                    `SELECT *
                     FROM bookings
                     ORDER BY created_at DESC`

                );


            res.json({

                success: true,

                bookings:
                    bookings

            });


        } catch (error) {

            console.error(
                "❌ Fetch Booking Error:"
            );

            console.error(
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to fetch bookings."

            });

        }

    }
);


// =========================================
// UPDATE BOOKING STATUS
// PROTECTED ADMIN ROUTE
// =========================================

app.patch(
    "/api/bookings/:id/status",
    verifyAdminToken,
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const {
                status
            } = req.body;


            const validStatuses = [

                "Pending",

                "Confirmed",

                "Cancelled"

            ];


            if (
                !validStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking status."

                });

            }


            const [
                result
            ] =
                await db.execute(

                    `UPDATE bookings
                     SET status = ?
                     WHERE id = ?`,

                    [
                        status,
                        id
                    ]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Booking status updated successfully."

            });


        } catch (error) {

            console.error(
                "❌ Status Update Error:"
            );

            console.error(
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update booking status."

            });

        }

    }
);


// =========================================
// DELETE BOOKING
// PROTECTED ADMIN ROUTE
// =========================================

app.delete(
    "/api/bookings/:id",
    verifyAdminToken,
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const [
                result
            ] =
                await db.execute(

                    `DELETE FROM bookings
                     WHERE id = ?`,

                    [
                        id
                    ]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Booking deleted successfully."

            });


        } catch (error) {

            console.error(
                "❌ Delete Booking Error:"
            );

            console.error(
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete booking."

            });

        }

    }
);


// =========================================
// START SERVER
// =========================================

app.listen(
    PORT,
    async () => {

        console.log(
            `🚀 Server running on http://localhost:${PORT}`
        );

        await testDatabaseConnection();

    }
);