const noodles = [
  { id: "original", name: "Original Noodles", description: "Savory signature broth", price: 89, icon: "🍜" },
  { id: "spicy", name: "Spicy Noodles", description: "Chili-rich, bold flavor", price: 99, icon: "🌶️" },
  { id: "beef", name: "Beef Noodles", description: "Tender beef and broth", price: 129, icon: "🥩" },
  { id: "chicken", name: "Chicken Noodles", description: "Comforting chicken soup", price: 119, icon: "🍗" },
  { id: "seafood", name: "Seafood Noodles", description: "Prawns, squid and greens", price: 149, icon: "🦐" },
  { id: "veggie", name: "Veggie Noodles", description: "Garden vegetables", price: 109, icon: "🥬" }
];

const drinks = [
  { id: "iced-tea", name: "House Iced Tea", description: "Refreshing citrus tea", price: 45, icon: "🧋" },
  { id: "lemonade", name: "Calamansi Lemonade", description: "Fresh and tangy", price: 55, icon: "🍋" },
  { id: "coke", name: "Iced Cola", description: "Chilled soft drink", price: 40, icon: "🥤" },
  { id: "water", name: "Mineral Water", description: "Cold bottled water", price: 25, icon: "💧" }
];

const desserts = [
  { id: "icecream", name: "Vanilla Ice Cream", description: "Creamy vanilla scoop", price: 35, icon: "🍨" },
  { id: "tiramisu", name: "Tiramisu Cup", description: "Coffee and cocoa", price: 65, icon: "🍰" },
  { id: "pudding", name: "Caramel Pudding", description: "Silky caramel pudding", price: 50, icon: "🍮" },
  { id: "banana", name: "Banana Fritters", description: "Warm crispy banana", price: 45, icon: "🍌" }
];

const addons = [
  { id: "egg", name: "Egg", price: 20 },
  { id: "cheese", name: "Cheese", price: 25 },
  { id: "ham", name: "Ham", price: 30 },
  { id: "sausage", name: "Sausage", price: 30 },
  { id: "corn", name: "Corn", price: 15 },
  { id: "dumplings", name: "Dumplings", price: 35 }
];

let orderType = "Delivery";
let activeCategory = "noodles";
let selectedNoodle = noodles[0];
let selectedSpice = "Mild";
let selectedAddons = [];
let cart = [];

const menuGrid = document.getElementById("menuGrid");
const customizer = document.getElementById("customizer");
const addonGrid = document.getElementById("addonGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const placeOrder = document.getElementById("placeOrder");

function formatPrice(value) {
  return `₱${value.toFixed(0)}`;
}

function renderMenu() {
  const items = activeCategory === "noodles" ? noodles : activeCategory === "drinks" ? drinks : desserts;
  menuGrid.innerHTML = items.map(item => `
    <button class="menu-card ${activeCategory === "noodles" && item.id === selectedNoodle.id ? "active" : ""}"
      type="button" data-id="${item.id}">
      <div class="food-icon">${item.icon}</div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <strong>${formatPrice(item.price)}</strong>
    </button>
  `).join("");

  customizer.style.display = activeCategory === "noodles" ? "block" : "none";

  menuGrid.querySelectorAll(".menu-card").forEach(card => {
    card.addEventListener("click", () => {
      const item = items.find(entry => entry.id === card.dataset.id);
      if (activeCategory === "noodles") {
        selectedNoodle = item;
        selectedAddons = [];
        renderAddons();
        renderMenu();
        updateCustomizer();
      } else {
        addToCart({
          key: `${item.id}-${Date.now()}`,
          name: item.name,
          detail: activeCategory === "drinks" ? "Drink" : "Dessert",
          price: item.price,
          icon: item.icon,
          quantity: 1
        });
        showToast(`${item.name} added to cart`);
      }
    });
  });
}

function renderAddons() {
  addonGrid.innerHTML = addons.map(addon => `
    <button class="addon-option ${selectedAddons.some(item => item.id === addon.id) ? "active" : ""}"
      type="button" data-id="${addon.id}">
      <span>${addon.name}</span><span>+${formatPrice(addon.price)}</span>
    </button>
  `).join("");

  addonGrid.querySelectorAll(".addon-option").forEach(button => {
    button.addEventListener("click", () => {
      const addon = addons.find(item => item.id === button.dataset.id);
      const index = selectedAddons.findIndex(item => item.id === addon.id);
      if (index >= 0) selectedAddons.splice(index, 1);
      else selectedAddons.push(addon);
      renderAddons();
      updateCustomizer();
    });
  });
}

function updateCustomizer() {
  const addonTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const total = selectedNoodle.price + addonTotal;
  document.getElementById("customizerName").textContent = selectedNoodle.name;
  document.getElementById("customizerPrice").textContent = formatPrice(total);
  document.querySelector("#addToCart span").textContent = formatPrice(total);
}

function addToCart(item) {
  cart.push(item);
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div><span class="empty-icon">🛒</span><p>Your cart is empty</p></div>
      </div>`;
  } else {
    cartItems.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-top">
          <div class="cart-item-icon">${item.icon}</div>
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-detail">${item.detail}</div>
          </div>
          <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
        <div class="cart-controls">
          <button class="qty-button" type="button" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-button" type="button" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `).join("");

    cartItems.querySelectorAll(".qty-button").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        if (button.dataset.action === "increase") cart[index].quantity += 1;
        if (button.dataset.action === "decrease") {
          cart[index].quantity -= 1;
          if (cart[index].quantity <= 0) cart.splice(index, 1);
        }
        renderCart();
      });
    });
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = formatPrice(total);
  placeOrder.disabled = cart.length === 0;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelectorAll(".order-type").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".order-type").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    orderType = button.dataset.orderType;
    document.getElementById("takeoutForm").hidden = orderType !== "Take-out";
  });
});

document.querySelectorAll(".category-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-tab").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    activeCategory = button.dataset.category;
    renderMenu();
  });
});

document.querySelectorAll(".spice-option").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".spice-option").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    selectedSpice = button.dataset.spice;
    document.getElementById("spiceSelection").textContent = selectedSpice;
  });
});

document.getElementById("addToCart").addEventListener("click", () => {
  const addonTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const detailParts = [selectedSpice, selectedAddons.length ? selectedAddons.map(item => item.name).join(", ") : "No add-ons"];
  addToCart({
    key: `${selectedNoodle.id}-${Date.now()}`,
    name: selectedNoodle.name,
    detail: detailParts.join(" · "),
    price: selectedNoodle.price + addonTotal,
    icon: selectedNoodle.icon,
    quantity: 1
  });
  showToast(`${selectedNoodle.name} added to cart`);
});

placeOrder.addEventListener("click", () => {
  if (orderType === "Take-out") {
    const takeoutForm = document.getElementById("takeoutForm");
    if (!takeoutForm.checkValidity()) {
      takeoutForm.reportValidity();
      return;
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const customerName = document.getElementById("customerName").value.trim();
  document.querySelector("#orderModal .modal-card > p:not(.eyebrow)").textContent =
    `${orderType} order${customerName ? ` for ${customerName}` : ""} (${formatPrice(total)}) has been received and will be prepared shortly.`;
  document.getElementById("orderModal").classList.add("open");
  document.getElementById("orderModal").setAttribute("aria-hidden", "false");
});

function closeModal() {
  document.getElementById("orderModal").classList.remove("open");
  document.getElementById("orderModal").setAttribute("aria-hidden", "true");
}

document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("orderModal").addEventListener("click", event => {
  if (event.target.id === "orderModal") closeModal();
});
document.getElementById("newOrder").addEventListener("click", () => {
  cart = [];
  renderCart();
  document.getElementById("takeoutForm").reset();
  closeModal();
});

renderMenu();
renderAddons();
updateCustomizer();
renderCart();
