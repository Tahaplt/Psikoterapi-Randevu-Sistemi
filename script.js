document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;

      fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, role })
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            alert(data.message);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "login.html";
          }
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

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            alert(data.message);
            localStorage.setItem("user", JSON.stringify(data.user));
            if (data.user.role === "psikolog") {
              window.location.href = "profile.html";
            } else {
              window.location.href = "randevu.html";
            }
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
    randevuForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const psikolog = document.getElementById("psikolog").value;
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;

      const user = JSON.parse(localStorage.getItem("user"));

      fetch("http://localhost:3000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: user.email, psikolog, date, time })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
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
    const user = JSON.parse(localStorage.getItem("user"));

    fetch(`http://localhost:3000/appointments?email=${user.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
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
              fetch(`http://localhost:3000/appointments/${id}`, {
                method: "DELETE"
              })
                .then(res => res.json())
                .then(result => {
                  alert(result.message);
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
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("user");
      alert("Çıkış yapıldı.");
      window.location.href = "login.html";
    });
  }

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      document.getElementById("fullName").value = storedUser.name || "";
      document.getElementById("email").value = storedUser.email || "";
      document.getElementById("specialty").value = storedUser.specialty || "";
      document.getElementById("city").value = storedUser.city || "";
      document.getElementById("availableHours").value = storedUser.availableHours || "";
    }

    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("fullName").value;
      const email = document.getElementById("email").value;
      const specialty = document.getElementById("specialty").value;
      const city = document.getElementById("city").value;
      const availableHours = document.getElementById("availableHours").value;

      let user = JSON.parse(localStorage.getItem("user")) || {};

      user.name = name;
      user.email = email;
      user.specialty = specialty;
      user.city = city;
      user.availableHours = availableHours;

      localStorage.setItem("user", JSON.stringify(user));

      alert("Profil bilgileriniz güncellendi!");
    });
  }
});
