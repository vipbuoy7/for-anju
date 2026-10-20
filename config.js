/*
  ============================================================
  EDIT THIS FILE ONLY. Everything Anju reads lives here.
  ============================================================

  - {name} becomes herName, {from} becomes fromName.
  - Stop 10 opens on startDate, Stop 9 the next day ... Stop 1 the day before revealDate.
  - The final page opens on revealDate, once all 10 stops are done.
  - activity options:
      envelope, balloons, hold, scratch, drag, arrow, catch, letters, candle, slide,
      match   (memory cards with your two photos)
      join    (drag her half-heart onto yours)
      puzzle  (swap tiles to fix her photo)

  TESTING: open the site with  ?test=<testKey>  at the end of the link.
  A test bar appears where you can unlock everything or pretend it's any date.
  Don't share that link with her.
*/

window.BIRTHDAY = {
  herName: "Anju",
  fromName: "Vipul",

  startDate: "2026-10-20",   // Stop 10
  revealDate: "2026-10-30",  // Her birthday: final page

  testKey: "vipul-tests-it",

  photos: {
    her: "assets/anju.jpg",
    herSquare: "assets/anju-square.jpg",  // used by the puzzle
    him: "assets/vipul.jpg"
  },

  title: "Ten Stops to Anju",
  subtitle: "A ride in ten stops, one a day. Each stop asks you to do something small before it lets you through.",

  // Shown at random when she taps a stop that hasn't opened yet.
  teases: [
    "Raha nahi jata, babu bhaiya?",
    "Be patient, jaan.",
    "You can't wait, can you?",
    "Itni bhi kya jaldi hai, Anju?",
    "Sabar ka phal meetha hota hai, madam.",
    "Picture abhi baaki hai, mere dost.",
    "Tareekh pe tareekh... aur yeh tareekh abhi aayi nahi.",
    "Dil hai ki maanta nahi, haan?",
    "Ruk ja, o dil deewane.",
    "Nice try. The door is still locked.",
    "Kal aana, kal. Promise it's worth it.",
    "Haww, peeking? Not allowed."
  ],

  days: {
    10: {
      title: "Your ticket",
      story: [
        "Ten days. Ten stops. One ride that ends on the best day of the year: your birthday.",
        "A new stop opens every night at midnight. None of them open early, so don't even try.",
        "The first one is easy. Someone left an envelope with your name on it."
      ],
      button: "Take the envelope",
      activity: "envelope",
      done: "Ticket accepted, {name}. Keep it safe. You'll need it all the way to the end."
    },
    9: {
      title: "The slow climb",
      story: [
        "Every roller coaster starts the same way. Click, click, click, up the first hill.",
        "Something is in the way though. Somebody went a little overboard with the balloons."
      ],
      button: "Clear the way",
      activity: "balloons",
      done: "Track clear. We're climbing now."
    },
    8: {
      title: "Find us",
      story: [
        "Up here the cards got shuffled by the wind.",
        "Somewhere in this mess there's you, and there's me. Find the pairs."
      ],
      button: "Flip the cards",
      activity: "match",
      done: "Found us. Like always."
    },
    7: {
      title: "A lucky ticket",
      story: [
        "Halfway up the hill there's a stall selling scratch cards.",
        "I bought one. I already know what's under the foil."
      ],
      button: "Scratch it",
      activity: "scratch",
      secret: "Redeemable for one long hug. No expiry date.",
      done: "Keep that one. I'll honour it whenever you cash it in."
    },
    6: {
      title: "Charging up",
      story: [
        "This car runs on one thing only, and it isn't petrol.",
        "Hold the heart until the tank is full. Let go and it drains, so don't let go."
      ],
      button: "Start charging",
      activity: "hold",
      done: "Full tank. That was quick. I'm not surprised."
    },
    5: {
      title: "Cupid's bad aim",
      story: [
        "Cupid missed a lot of people before he got to us.",
        "Let's see if you can do better than him."
      ],
      button: "Pick up the bow",
      activity: "arrow",
      hits: 2,
      done: "Two for two. Cupid should take lessons from you."
    },
    4: {
      title: "Two halves",
      story: [
        "Half a heart doesn't do much on its own. Trust me, I tried.",
        "Mine is already here. Bring yours over."
      ],
      button: "Bring it over",
      activity: "join",
      done: "There. That's the whole thing."
    },
    3: {
      title: "Spell it out",
      story: [
        "Three stops left. The ride is going fast now.",
        "Someone scrambled the sign at this station. You know the word. It's the one I say the most."
      ],
      button: "Fix the sign",
      activity: "letters",
      done: "That's the one. Best word I know."
    },
    2: {
      title: "Picture perfect",
      story: [
        "My favourite picture got cut into pieces. Somebody's idea of a joke.",
        "Put it back together. You know exactly what it's supposed to look like."
      ],
      button: "Fix the picture",
      activity: "puzzle",
      done: "Perfect. Like the girl in it."
    },
    1: {
      title: "Practice run",
      story: [
        "Last stop before the end of the line.",
        "Tomorrow there will be a real cake with real candles. Consider this a rehearsal.",
        "Close your eyes, make a wish, then blow."
      ],
      button: "Light the candle",
      activity: "candle",
      done: "Wish received. See you tomorrow, birthday girl."
    }
  },

  final: {
    stopLabel: "Her day",
    title: "Happy Birthday",
    photo: "assets/anju.jpg",
    caption: "",
    tags: ["Anju", "Birthday Girl", "30.10", "Jaan", "Queen", "Happy B'day", "Party!", "Mine", "Cutie", "♥"],
    story: [
      "First of all, Hapla Birthday, Jaan! ❤️",
      "I never knew that someone as sweet and beautiful as you could exist. I wish you a life full of happiness, laughter, and countless beautiful moments ahead. (I know I’m the one who ends up ruining some of those moments for you. 🥹) But I promise I’ll try my best to be the perfect pilla for you and make you laugh, no matter what, especially when you need it the most.",
      "Thank you for existing and for being the person you are. I’ve never met someone with a heart as kind and pure as yours. I know you might think I’m just saying all this, but I genuinely mean every word of it. ❤️",
      "I’m sorry for all the fights, tears, and moments when I’ve hurt you. You deserve so much happiness, and I hope I can be a reason behind your smiles more often than your tears.",
      "And hopefully, by your next birthday, we’ll be celebrating our car endeavour too. 🫶🏻 But there’s just one condition: you have to open a liquor store in Gurugram for me first so I can buy whatever I want. 😂",
      "Until then, please accept this as one of my little gifts. 😉❤️",
      "Happy Birthday once again, Jaan. Thank you for being you. I’m so lucky to have you in my life. ❤️🧿"
    ],
    signoff: "Yours, {from}"
  }
};
