require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const combinationSchema = new mongoose.Schema({
  email: String,
  combination: [String],
  username: String,
  savedAt: { type: Date, default: Date.now }
});
const Combination = mongoose.model("Combination", combinationSchema);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/save-combination", async (req, res) => {
  const { email, combination } = req.body;

  if (!email || !Array.isArray(combination)) {
    return res.status(400).json({ error: "Email and combination are required" });
  }

  try {
    const existing = await Combination.findOne({ email });
    let isSelfWin = false;

    if (existing) {
      if (JSON.stringify(existing.combination) === JSON.stringify(combination)) {
        isSelfWin = true;
      } else {
        existing.username = req.body.username || existing.username;
        existing.combination = combination;
        existing.savedAt = new Date();
        await existing.save();
      }
    } else {
      await Combination.create({ email, combination, username: req.body.username });
    }

    const matchingUser = await Combination.findOne({
      email: { $ne: email },
      combination,
      username: { $exists: true }
    });

    const rarityMessage = getRarityMessage(combination.length);
    const emailNote = isSelfWin
      ? "This should not have ben probable, but it really happened. You matched your previous combination! This counts as a WIN."
      : "\nNote: Any new combination you save with this same email will overwrite your previous one.";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Card Permutation DNA",
      text: `Your Combination:\n${combination.join(", ")} \nYou are under the username, ${req.body.username || "Anonymous"}.\n\n${rarityMessage}\n\n${emailNote}`,
    });

    if (matchingUser) {
      const winMessage = `This should not have been probable, but it really happened. MATCH FOUND! Your combination matches with another user.\n\nCombination:\n${combination.join(", ")}\n\nYou will be added to the leaderboard soon.`;

      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: [email, matchingUser.email],
        subject: "Card Combination Match Found!",
        text: winMessage
      });
    }

    res.json({
      message: isSelfWin
        ? "This should not have been probable, but it really happened. You matched your previous combination! YOU WIN."
        : matchingUser
          ? "Combination saved. MATCH FOUND with another user!"
          : "Combination saved/updated and email sent successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save or send email" });
  }
});

function getRarityMessage(n) {
  if (n > 20) {
    return `The odds of randomly getting this exact sequence are astronomically small (less than 1 in 80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000) \n That's 5,767,965,995,186,426,835,969,569,168,845,168,370,013,557,489,664,000,000,000,000 times harder than winning the lottery.`;
  }
  return `The odds of randomly getting this exact sequence are 1 in ${factorial(n).toLocaleString()}.`;
}

function factorial(num) {
  let result = 1n;
  for (let i = 2n; i <= BigInt(num); i++) {
    result *= i;
  }
  return result;
}



function findMatches(deck1, deck2) {
  let maxMatch = [];

  for (let i = 0; i < deck1.length; i++) {
    for (let j = 0; j < deck2.length; j++) {
      let k = 0;
      while (i + k < deck1.length && j + k < deck2.length && deck1[i + k] === deck2[j + k]) {
        k++;
      }
      if (k > maxMatch.length) {
        maxMatch = deck1.slice(i, i + k);
      }
    }
  }
  return maxMatch;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
