// ================================
// 🛒 ADD TO CART
// ================================
function addToCart(name, price) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({ name, price });

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert(name + " added to cart!");
}


// ================================
// 🧮 UPDATE CART COUNT
// ================================
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let el = document.getElementById("cart-count");

    if (el) el.innerText = cart.length;
}


// ================================
// 🔄 PLACE ORDER
// ================================
async function placeOrder() {

    const order = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        icecream: document.getElementById("icecream").value,
        scoops: parseInt(document.getElementById("scoops").value),
        quantity: parseInt(document.getElementById("qty").value)
    };

    // validation
    if (!order.name || !order.email || !order.phone || !order.address || !order.icecream) {
        alert("Please fill all fields");
        return;
    }

    if (order.scoops < 1 || order.quantity < 1) {
        alert("Scoops and Quantity must be at least 1");
        return;
    }

    try {
        const res = await fetch("http://localhost:3001/api/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.removeItem("selectedIcecream");
            window.location.href = "success.html";
        } else {
            alert(data.error || "Order failed");
        }

    } catch (err) {
        console.error(err);
        alert("Server not running or API error");
    }
}


// ================================
// 📩 CONTACT FORM
// ================================
async function sendMessage() {

    const contact = {
        name: document.getElementById("contact_name").value.trim(),
        email: document.getElementById("contact_email").value.trim(),
        phone: document.getElementById("contact_phone").value.trim(),
        message: document.getElementById("contact_message").value.trim()
    };

    if (!contact.name || !contact.email || !contact.message) {
        alert("Please fill all required fields");
        return;
    }

    try {
        const res = await fetch("http://localhost:3001/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contact)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Message sent successfully!");
        } else {
            alert(data.error || "Failed to send message");
        }

        // clear form
        document.getElementById("contact_name").value = "";
        document.getElementById("contact_email").value = "";
        document.getElementById("contact_phone").value = "";
        document.getElementById("contact_message").value = "";

    } catch (err) {
        console.error(err);
        alert("Server not running or API error");
    }
}

// ================================
// 🔄 PAGE LOAD EVENTS (ONLY ONE)
// ================================
window.addEventListener("load", () => {

    // update cart count
    updateCartCount();

    // auto-fill icecream dropdown
    const selected = localStorage.getItem("selectedIcecream");
    const dropdown = document.getElementById("icecream");

    if (selected && dropdown) {
        dropdown.value = selected;
    }
});

function subscribeNewsletter() {
    const email = document.getElementById("newsletter_email").value.trim();

    if (!email) {
        alert("Please enter email");
        return;
    }

    let list = JSON.parse(localStorage.getItem("newsletter")) || [];
    list.push(email);

    localStorage.setItem("newsletter", JSON.stringify(list));

    alert("Subscribed successfully!");
    document.getElementById("newsletter_email").value = "";
}
