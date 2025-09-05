import QuizResult from "../models/quizResult.js";

// Add result for a quiz session
export const saveQuizResult = async (req, res) => {
  try {
    const {
      quizSessionId,
      receiverId,
      totalQuestions,

      answers,
    } = req.body;

    const userId = req.user._id;

    const existing = await QuizResult.findOne({ quizSessionId, userId });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Result already submitted by this user." });
    }

    const result = await QuizResult.create({
      quizSessionId,
      userId,
      receiverId,
      totalQuestions,
      answers,
    });

    res.status(201).json({ status: true, result });
  } catch (err) {
    console.error("Error saving quiz result:", err);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getQuizResultsBySession = async (req, res) => {
  try {
    const { quizSessionId } = req.params;

    const results = await QuizResult.find({ quizSessionId })
      .populate("userId", "name")
      .populate("receiverId", "name");

    console.log("result by sessioId : ", results);

    if (results.length !== 2) {
      return res
        .status(400)
        .json({ status: false, message: "Incomplete results" });
    }

    const [user1, user2] = results;

    const answers1 = user1.answers;
    const answers2 = user2.answers;

    let shared = 0;
    let points1 = 0;
    let points2 = 0;
    const totalQuestions = Math.max(answers1.length, answers2.length);

    for (let i = 0; i < totalQuestions; i++) {
      const ans1 = answers1[i];
      const ans2 = answers2[i];

      if (!ans1 || !ans2) continue;

      if (ans1 === ans2) {
        shared++;
        points1 += 10;
        points2 += 10;
      } else if (isSameCategory(ans1, ans2)) {
        points1 += 5;
        points2 += 5;
      } else {
        // 0 points
      }
    }

    const maxPossiblePoints = totalQuestions * 10;
    const averagePoints = (points1 + points2) / 2;
    const compatibility = Math.round((averagePoints / maxPossiblePoints) * 100);

    res.status(200).json({
      status: true,
      compatibility,
      shared,
      totalQuestions,
      results: [
        {
          user: user1.userId,
          score: points1,
          answers: answers1,
        },
        {
          user: user2.userId,
          score: points2,
          answers: answers2,
        },
      ],
    });
  } catch (err) {
    console.error("Error fetching quiz results:", err);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Match answer to category logic
function isSameCategory(a, b) {
  const selfSoothing = [
    "Meditation or a solo walk in nature",
    "Listening to music and getting lost in thought",
  ];
  const socialSupport = [
    "Going out with friends to clear your head",
    "Talking it out with someone close",
  ];

  return (
    (selfSoothing.includes(a) && selfSoothing.includes(b)) ||
    (socialSupport.includes(a) && socialSupport.includes(b))
  );
}
