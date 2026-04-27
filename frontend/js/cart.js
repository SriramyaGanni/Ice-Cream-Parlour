// ================================
// 🛒 ADD TO CART
// ================================
function addToCart(name, price) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({ name, price });

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    localStorage.setItem("selectedIcecream", name);

    alert(name + " added to cart!");
}

// ================================
// 🔢 CART COUNT
// ================================
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let el = document.getElementById("cart-count");

    if (el) el.innerText = cart.length;
}

// ================================
// 📦 AUTO SELECT ICECREAM (ORDER PAGE)
// ================================
function autoFillIcecream() {
    const selected = localStorage.getItem("selectedIcecream");
    const dropdown = document.getElementById("icecream");

    if (selected && dropdown) {
        dropdown.value = selected;
    }
}

// ================================
// 🚀 INITIAL LOAD
// ================================
window.addEventListener("load", () => {
    updateCartCount();
    autoFillIcecream();
});