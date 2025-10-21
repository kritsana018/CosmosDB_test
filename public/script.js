const form = document.getElementById("feedbackForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const emailInput = document.getElementById("email");         // เพิ่มช่อง email
const ratingInput = document.getElementById("rating");       // เพิ่มช่อง rating (1-5)
const categoryInput = document.getElementById("category");   // เพิ่มช่อง category
const subscribeCheckbox = document.getElementById("subscribe"); // เพิ่ม checkbox
const list = document.getElementById("feedbackList");

async function loadFeedback() {
  const res = await fetch("/api/feedback");
  const data = await res.json();
  list.innerHTML = data.map(f => {
    const email = f.email ? ` <small>(${f.email})</small>` : "";
    const rating = f.rating ? ` <span>⭐${f.rating}</span>` : "";
    const category = f.category ? ` <em>[${f.category}]</em>` : "";
    const subscribed = f.subscribe ? ` <small>(subscribed)</small>` : "";
    return `<li><b>${f.name}</b>${email}:${category} ${f.message}${rating}${subscribed}</li>`;
  }).join("");
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const message = messageInput.value.trim();
  const email = emailInput?.value?.trim() || "";
  const rating = ratingInput?.value || "";
  const category = categoryInput?.value || "";
  const subscribe = !!(subscribeCheckbox && subscribeCheckbox.checked);

  if (!name || !message) {
    alert("กรุณากรอกชื่อและข้อความ");
    return;
  }

  await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message, email, rating, category, subscribe })
  });

  form.reset();
  loadFeedback();
});

loadFeedback();
