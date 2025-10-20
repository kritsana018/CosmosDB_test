const form = document.getElementById("feedbackForm");
const list = document.getElementById("feedbackList");

async function loadFeedback() {
  const res = await fetch("/api/feedback");
  const data = await res.json();
  list.innerHTML = data.map(f => `<li><b>${f.name}</b>: ${f.message}</li>`).join("");
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message })
  });

  form.reset();
  loadFeedback();
});

loadFeedback();
