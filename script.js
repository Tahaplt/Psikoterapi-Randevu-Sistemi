document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  const header = document.querySelector("header");
  if (header) {
    let liveClock = document.getElementById("liveClock");
    if (!liveClock) {
      liveClock = document.createElement("span");
      liveClock.id = "liveClock";
      header.appendChild(liveClock);
    }

    let clockText = document.getElementById("clockText");
    let themeToggle = document.getElementById("themeToggle");

    if (!clockText || !themeToggle) {
      liveClock.innerHTML = '<span id="clockText"></span><button id="themeToggle" type="button" aria-label="Tema Değiştir"></button>';
      clockText = document.getElementById("clockText");
      themeToggle = document.getElementById("themeToggle");
    }

    function setToggleIcon() {
      themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    }

    function tick() {
      const now = new Date();
      const tarih = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const saat = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      clockText.textContent = `${tarih} ${saat}`;
    }

    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
      setToggleIcon();
    });

    setToggleIcon();
    tick();
    setInterval(tick, 1000);
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const nameEl = document.getElementById("name");
      const emailEl = document.getElementById("email");
      const passEl = document.getElementById("password");
      const roleEl = document.getElementById("role");

      const name = nameEl ? nameEl.value.trim() : "";
      const email = emailEl ? emailEl.value.trim() : "";
      const password = passEl ? passEl.value.trim() : "";
      const role = roleEl ? roleEl.value : "";

      fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.message) alert(data.message);
          window.location.href = "login.html";
        })
        .catch(err => {
          console.error("Kayıt hatası:", err);
          alert("Kayıt sırasında bir hata oluştu.");
        });
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailEl = document.getElementById("email");
      const passEl = document.getElementById("password");

      const email = emailEl ? emailEl.value.trim() : "";
      const password = passEl ? passEl.value.trim() : "";

      fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.message) alert(data.message);
          if (data && data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = data.user.role === "psikolog" ? "profile.html" : "randevu.html";
          }
        })
        .catch(err => {
          console.error("Giriş hatası:", err);
          alert("Giriş sırasında bir hata oluştu.");
        });
    });
  }

  const randevuForm = document.getElementById("randevuForm");
  if (randevuForm) {
    const dateEl = document.getElementById("tarih") || document.getElementById("date");
    if (dateEl && dateEl.type === "date") {
      dateEl.min = new Date().toISOString().split("T")[0];
    }

    randevuForm.addEventListener("submit", function (e) {
      const psikologEl = document.getElementById("psikologSec") || document.getElementById("psikolog");
      const dateEl2 = document.getElementById("tarih") || document.getElementById("date");
      const timeEl = document.getElementById("saatSec") || document.getElementById("time");

      if (!psikologEl || !dateEl2 || !timeEl) return;

      e.preventDefault();

      const psikolog = psikologEl.value;
      const date = dateEl2.value;
      const time = timeEl.value;

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user || !user.email) return alert("Lütfen önce giriş yapın.");

      fetch("http://localhost:3000/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, psikolog, date, time })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.message) alert(data.message);
          randevuForm.reset();
        })
        .catch(err => {
          console.error("Randevu hatası:", err);
          alert("Randevu alınamadı.");
        });
    });
  }

  const appointmentsList = document.getElementById("appointmentsList");
  if (appointmentsList) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.email) {
      appointmentsList.innerHTML = "<p>Lütfen önce giriş yapın.</p>";
      return;
    }

    fetch(`http://localhost:3000/appointments?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          appointmentsList.innerHTML = "<p>Henüz randevunuz yok.</p>";
        } else {
          const ul = document.createElement("ul");

          data.forEach(appt => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${appt.psikolog}</strong> ile ${appt.date} tarihinde saat ${appt.time} <button class="deleteBtn" data-id="${appt.id}">Sil</button>`;
            ul.appendChild(li);
          });

          appointmentsList.innerHTML = "";
          appointmentsList.appendChild(ul);

          document.querySelectorAll(".deleteBtn").forEach(button => {
            button.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              fetch(`http://localhost:3000/appointments/${id}`, { method: "DELETE" })
                .then(res => res.json())
                .then(result => {
                  if (result && result.message) alert(result.message);
                  location.reload();
                })
                .catch(err => {
                  console.error("Silme hatası:", err);
                  alert("Silme işlemi başarısız.");
                });
            });
          });
        }
      })
      .catch(err => {
        console.error("Randevular alınamadı:", err);
        appointmentsList.innerHTML = "<p>Randevular alınamadı.</p>";
      });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      if (logoutBtn.tagName.toLowerCase() === "a") e.preventDefault();
      localStorage.removeItem("user");
      alert("Çıkış yapıldı.");
      window.location.href = "login.html";
    });
  }

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    const fullNameEl = document.getElementById("fullName");
    const emailEl = document.getElementById("email");
    const specialtyEl = document.getElementById("specialty");
    const cityEl = document.getElementById("city");
    const availableHoursEl = document.getElementById("availableHours");

    if (storedUser) {
      if (fullNameEl) fullNameEl.value = storedUser.name || "";
      if (emailEl) emailEl.value = storedUser.email || "";
      if (specialtyEl) specialtyEl.value = storedUser.specialty || "";
      if (cityEl) cityEl.value = storedUser.city || "";
      if (availableHoursEl) availableHoursEl.value = storedUser.availableHours || "";
    }

    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let user = JSON.parse(localStorage.getItem("user") || "{}");

      if (fullNameEl) user.name = fullNameEl.value;
      if (emailEl) user.email = emailEl.value;
      if (specialtyEl) user.specialty = specialtyEl.value;
      if (cityEl) user.city = cityEl.value;
      if (availableHoursEl) user.availableHours = availableHoursEl.value;

      localStorage.setItem("user", JSON.stringify(user));
      alert("Profil bilgileriniz güncellendi!");
    });
  }
});
