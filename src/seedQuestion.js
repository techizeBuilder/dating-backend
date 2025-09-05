import mongoose from "mongoose";
import QuizQuestion from "./models/quizQuestionModel.js";

const MONGO_URI =
  "mongodb+srv://jeeturadicalloop:Mjvesqnj8gY3t0zP@cluster0.by2xy6x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB URI

const questions = [
  // ---------- Stage 1 ----------
  {
    question:
      "If you could be any animal for a week, which would you choose and why?",
    options: [
      {
        text: "A wise owl – I like observing quietly",
        category: "Self Soothing",
      },
      {
        text: "A playful dolphin – I love connecting",
        category: "Social Support",
      },
      {
        text: "A strong lion – I enjoy leading",
        category: "Self Soothing",
      },
      {
        text: "A curious monkey – I love exploring",
        category: "Social Support",
      },
    ],
    status: "active",
    stage: 1,
  },
  {
    question: "What's your favorite childhood memory?",
    options: [
      { text: "Playing games alone", category: "Self Soothing" },
      { text: "Family vacations and laughter", category: "Social Support" },
      { text: "Learning new things at school", category: "Self Soothing" },
      { text: "Birthday parties with friends", category: "Social Support" },
    ],
    status: "active",
    stage: 1,
  },
  {
    question: "What was your dream job as a kid?",
    options: [
      { text: "Working with animals or nature", category: "Self Soothing" },
      { text: "A performer or teacher", category: "Social Support" },
      { text: "An inventor or scientist", category: "Self Soothing" },
      { text: "A superhero or explorer", category: "Social Support" },
    ],
    status: "active",
    stage: 1,
  },
  {
    question: "What's one thing you're unbeatable at?",
    options: [
      { text: "Staying calm in chaos", category: "Self Soothing" },
      { text: "Making people laugh", category: "Social Support" },
      { text: "Solving puzzles quickly", category: "Self Soothing" },
      { text: "Cheering up others", category: "Social Support" },
    ],
    status: "active",
    stage: 1,
  },
  // {
  //   question: "If you could travel anywhere right now, where would you go?",
  //   options: [
  //     { text: "A quiet cabin in the mountains", category: "Self Soothing" },
  //     { text: "A vibrant city with friends", category: "Social Support" },
  //     { text: "A peaceful beach retreat", category: "Self Soothing" },
  //     { text: "A cultural festival abroad", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 1,
  // },
  // {
  //   question: "What's the best advice you've ever received?",
  //   options: [
  //     { text: "Trust yourself", category: "Self Soothing" },
  //     { text: "Lean on others when needed", category: "Social Support" },
  //     { text: "Be patient with growth", category: "Self Soothing" },
  //     { text: "Always show kindness", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 1,
  // },
  // {
  //   question: "What's your favorite way to relax after a long day?",
  //   options: [
  //     { text: "Listen to music alone", category: "Self Soothing" },
  //     { text: "Chat with someone close", category: "Social Support" },
  //     { text: "Read a good book", category: "Self Soothing" },
  //     { text: "Go for a walk with a friend", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 1,
  // },
  // {
  //   question: "If you had an extra hour every day, how would you spend it?",
  //   options: [
  //     { text: "Reflect or write", category: "Self Soothing" },
  //     { text: "Call a friend or family", category: "Social Support" },
  //     { text: "Practice a hobby", category: "Self Soothing" },
  //     { text: "Volunteer or help others", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 1,
  // },
  // {
  //   question: "What's one surprising life lesson you've learned?",
  //   options: [
  //     { text: "Being alone isn’t lonely", category: "Self Soothing" },
  //     { text: "We all crave connection", category: "Social Support" },
  //     { text: "Patience brings peace", category: "Self Soothing" },
  //     { text: "Vulnerability builds trust", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 1,
  // },
  // {
  //   question: "What’s your go-to fun fact about yourself?",
  //   options: [
  //     { text: "I taught myself a weird skill", category: "Self Soothing" },
  //     { text: "I’ve met someone famous", category: "Social Support" },
  //     { text: "I collect unusual items", category: "Self Soothing" },
  //     { text: "I have a unique talent", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 1,
  // },

  // ---------- Stage 2 ----------
  {
    question: "What word do people close to you often use to describe you?",
    options: [
      { text: "Independent", category: "Self Soothing" },
      { text: "Loyal", category: "Social Support" },
      { text: "Thoughtful", category: "Self Soothing" },
      { text: "Supportive", category: "Social Support" },
    ],
    status: "active",
    stage: 2,
  },
  {
    question: "What core values guide your actions and decisions?",
    options: [
      { text: "Peace & honesty", category: "Self Soothing" },
      { text: "Love & loyalty", category: "Social Support" },
      { text: "Integrity & kindness", category: "Self Soothing" },
      { text: "Compassion & trust", category: "Social Support" },
    ],
    status: "active",
    stage: 2,
  },
  {
    question: "How do you define success in life?",
    options: [
      { text: "Inner peace", category: "Self Soothing" },
      { text: "Strong relationships", category: "Social Support" },
      { text: "Personal growth", category: "Self Soothing" },
      { text: "Helping others", category: "Social Support" },
    ],
    status: "active",
    stage: 2,
  },
  {
    question: "Do you have a personal philosophy that shapes your life?",
    options: [
      { text: "Be calm, be kind", category: "Self Soothing" },
      { text: "Give more than you take", category: "Social Support" },
      { text: "Focus on the present", category: "Self Soothing" },
      { text: "Act with empathy", category: "Social Support" },
    ],
    status: "active",
    stage: 2,
  },
  // {
  //   question: "If you had to live by one value, what would it be?",
  //   options: [
  //     { text: "Peace", category: "Self Soothing" },
  //     { text: "Empathy", category: "Social Support" },
  //     { text: "Honesty", category: "Self Soothing" },
  //     { text: "Gratitude", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 2,
  // },
  // {
  //   question: "Which values are most important to you right now?",
  //   options: [
  //     { text: "Patience and self-growth", category: "Self Soothing" },
  //     { text: "Connection and love", category: "Social Support" },
  //     { text: "Calmness and mindfulness", category: "Self Soothing" },
  //     { text: "Support and kindness", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 2,
  // },
  // {
  //   question: "Describe a time your values guided a tough decision.",
  //   options: [
  //     { text: "Choosing peace over conflict", category: "Self Soothing" },
  //     { text: "Standing up for someone", category: "Social Support" },
  //     { text: "Being honest even if hard", category: "Self Soothing" },
  //     { text: "Helping others in need", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 2,
  // },
  // {
  //   question: "Which animal best represents your personality?",
  //   options: [
  //     { text: "A cat — calm and observant", category: "Self Soothing" },
  //     { text: "A dog — loyal and warm", category: "Social Support" },
  //     { text: "A horse — free and strong", category: "Self Soothing" },
  //     { text: "A bird — social and lively", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 2,
  // },
  // {
  //   question: "Who is your hero, and what does that say about you?",
  //   options: [
  //     { text: "Someone who taught me to be strong", category: "Self Soothing" },
  //     {
  //       text: "Someone who gave unconditional love",
  //       category: "Social Support",
  //     },
  //     { text: "Someone who showed me courage", category: "Self Soothing" },
  //     { text: "Someone who always listened", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 2,
  // },
  // {
  //   question: "What does happiness mean to you?",
  //   options: [
  //     { text: "Contentment within", category: "Self Soothing" },
  //     { text: "Being surrounded by loved ones", category: "Social Support" },
  //     { text: "Peace in everyday moments", category: "Self Soothing" },
  //     { text: "Sharing joy with others", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 2,
  // },

  // ---------- Stage 3 ----------
  {
    question: "What's the kindest thing someone has ever done for you?",
    options: [
      { text: "Supported me when I isolated", category: "Self Soothing" },
      { text: "Listened without judgment", category: "Social Support" },
      { text: "Gave me space to heal", category: "Self Soothing" },
      { text: "Stayed by my side", category: "Social Support" },
    ],
    status: "active",
    stage: 3,
  },
  {
    question: "Who do you trust most and why?",
    options: [
      { text: "Myself — I’ve earned it", category: "Self Soothing" },
      {
        text: "A close friend who always shows up",
        category: "Social Support",
      },
      { text: "A family member who understands me", category: "Self Soothing" },
      { text: "A mentor who guides me", category: "Social Support" },
    ],
    status: "active",
    stage: 3,
  },
  {
    question: "What moment still brings you tears?",
    options: [
      { text: "A private memory I cherish", category: "Self Soothing" },
      { text: "Saying goodbye to someone close", category: "Social Support" },
      { text: "Overcoming a big challenge", category: "Self Soothing" },
      { text: "Witnessing an act of kindness", category: "Social Support" },
    ],
    status: "active",
    stage: 3,
  },
  {
    question: "When did you last feel deeply understood?",
    options: [
      { text: "During self-reflection", category: "Self Soothing" },
      { text: "During a vulnerable conversation", category: "Social Support" },
      { text: "When journaling my thoughts", category: "Self Soothing" },
      { text: "When a friend really listened", category: "Social Support" },
    ],
    status: "active",
    stage: 3,
  },
  // {
  //   question: "What relationship has shaped you the most?",
  //   options: [
  //     { text: "A mentor or parent", category: "Self Soothing" },
  //     { text: "A romantic partner", category: "Social Support" },
  //     { text: "A close friend", category: "Self Soothing" },
  //     { text: "A supportive community", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 3,
  // },
  // {
  //   question: "What does emotional safety feel like to you?",
  //   options: [
  //     { text: "Being alone without judgment", category: "Self Soothing" },
  //     { text: "Being heard fully", category: "Social Support" },
  //     { text: "Feeling secure in myself", category: "Self Soothing" },
  //     { text: "Feeling accepted by others", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 3,
  // },
  // {
  //   question: "What's something you wish others knew about you?",
  //   options: [
  //     { text: "I’m softer than I appear", category: "Self Soothing" },
  //     { text: "I care more than I show", category: "Social Support" },
  //     { text: "I need time to open up", category: "Self Soothing" },
  //     { text: "I deeply value loyalty", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 3,
  // },
  // {
  //   question: "What memory always makes you smile?",
  //   options: [
  //     { text: "Peaceful alone time", category: "Self Soothing" },
  //     { text: "Laughing with someone I love", category: "Social Support" },
  //     { text: "Achieving a personal goal", category: "Self Soothing" },
  //     { text: "A funny moment with friends", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 3,
  // },
  // {
  //   question: "When was the last time you felt deeply loved?",
  //   options: [
  //     { text: "Through a kind action", category: "Self Soothing" },
  //     { text: "In someone’s words or hug", category: "Social Support" },
  //     { text: "By spending quiet time together", category: "Self Soothing" },
  //     { text: "When someone trusted me", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 3,
  // },
  // {
  //   question: "What emotion do you find hardest to express?",
  //   options: [
  //     { text: "Anger or frustration", category: "Self Soothing" },
  //     { text: "Sadness or vulnerability", category: "Social Support" },
  //     { text: "Fear or anxiety", category: "Self Soothing" },
  //     { text: "Joy or excitement", category: "Social Support" },
  //   ],
  //   status: "active",
  //   stage: 3,
  // },
];

const seedQuestions = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await QuizQuestion.deleteMany(); // Optional: clears old data
    await QuizQuestion.insertMany(questions);
    console.log("✅ All quiz questions inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting questions:", err);
    process.exit(1);
  }
};

seedQuestions();
