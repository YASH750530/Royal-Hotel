// =========================================
// ROYAL HOTEL ADMIN LOGIN
// JWT BACKEND VERSION
// =========================================

const API_URL = "https://royal-hotel-h2mc.onrender.com";

const loginForm =
    document.getElementById("login-form");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            document.getElementById("username")
                .value.trim();


        const password =
            document.getElementById("password")
                .value;


        const loginMessage =
            document.getElementById(
                "login-message"
            );


        // =========================================
        // BASIC VALIDATION
        // =========================================

        if (!username || !password) {

            loginMessage.textContent =
                "❌ Please enter username and password.";

            return;
        }


        // =========================================
        // LOGIN API
        // =========================================

        try {

            loginMessage.textContent =
                "⏳ Logging in...";


            const response =
                await fetch(
                    `${API_URL}/api/admin/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            // =========================================
            // LOGIN FAILED
            // =========================================

            if (!response.ok || !data.success) {

                loginMessage.textContent =
                    "❌ " +
                    (
                        data.message ||
                        "Invalid username or password."
                    );

                return;
            }


            // =========================================
            // SAVE JWT TOKEN
            // =========================================

            localStorage.setItem(
                "adminToken",
                data.token
            );


            loginMessage.textContent =
                "✅ Login successful!";


            // =========================================
            // REDIRECT
            // =========================================

            setTimeout(function () {

                window.location.href =
                    "admin-dashboard.html";

            }, 500);


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            loginMessage.textContent =
                "❌ Server connection failed.";

        }

    }
);