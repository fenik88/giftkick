const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // отдаём папку public

const PORT = process.env.PORT || 3000;

// --- Хранилище пользователей (MVP, в памяти)
let users = {};

// --- Создать или получить пользователя
app.post("/api/user", (req, res) => {
  const { userId, name } = req.body;
  if (!users[userId]) {
    users[userId] = { name: name || "Игрок", balance: 1000 };
  }
  res.json({ ok: true, user: users[userId] });
});

// --- Ракетка (Crash)
app.post("/api/rocket", (req, res) => {
  const { userId, bet } = req.body;
  const user = users[userId];
  if (!user) return res.status(400).json({ ok: false, error: "User not found" });
  if (bet > user.balance) return res.status(400).json({ ok: false, error: "Недостаточно средств" });

  const crashAt = parseFloat((Math.random() * 11 + 1).toFixed(2));
  user.balance -= bet;

  res.json({ ok: true, crashAt, newBalance: user.balance });
});

// --- Кейсы
app.post("/api/case", (req, res) => {
  const { userId, cost } = req.body;
  const user = users[userId];
  if (!user) return res.status(400).json({ ok: false, error: "User not found" });
  if (cost > user.balance) return res.status(400).json({ ok: false, error: "Недостаточно средств" });

  user.balance -= cost;

  const r = Math.random();
  let prize = "Обычный подарок";
  let payout = 0;

  if (r > 0.95) { prize = "Супер редкий подарок"; payout = cost * 8; }
  else if (r > 0.7) { prize = "Редкий подарок"; payout = cost * 2; }

  user.balance += payout;

  res.json({ ok: true, prize, payout, newBalance: user.balance });
});

// --- Апгрейды
app.post("/api/upgrade", (req, res) => {
  const { userId, stake, mult } = req.body;
  const user = users[userId];
  if (!user) return res.status(400).json({ ok: false, error: "User not found" });
  if (stake > user.balance) return res.status(400).json({ ok: false, error: "Недостаточно средств" });

  const probs = { 2: 0.5, 5: 0.2, 10: 0.1 };
  const chance = probs[mult] || 0.1;

  user.balance -= stake;

  const won = Math.random() < chance;
  if (won) user.balance += stake * mult;

  res.json({ ok: true, won, gain: won ? stake * mult : 0, newBalance: user.balance });
});

// --- Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

