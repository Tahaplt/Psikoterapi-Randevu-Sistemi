document.addEventListener("DOMContentLoaded", function () {
  const applyTheme = (theme) => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  };

  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme === "dark" ? "dark" : "light");

  const header = document.querySelector("header");
  if (header) {
    let liveClock = document.getElementById("liveClock");
    if (!liveClock) {
      liveClock = document.createElement("span");
      liveClock.id = "liveClock";
      header.appendChild(liveClock);
    }

    liveClock.innerHTML = '<button id="themeToggle" type="button" aria-label="Tema Değiştir"></button><span id="clockText"></span>';

    const themeToggle = document.getElementById("themeToggle");
    const clockText = document.getElementById("clockText");

    const setIcon = () => {
      themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    };

    const tick = () => {
      const now = new Date();
      const tarih = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const saat = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      clockText.textContent = `${tarih} ${saat}`;
    };

    themeToggle.addEventListener("click", () => {
      const next = document.body.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
      setIcon();
    });

    setIcon();
    tick();
    setInterval(tick, 1000);
  }
});
