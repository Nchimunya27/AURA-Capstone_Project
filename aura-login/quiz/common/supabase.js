// Common Supabase initialization and utilities
const SUPABASE_URL = "https://uumdfsnboqkounadxijq.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWRmc25ib3Frb3VuYWR4aWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDc5NzMsImV4cCI6MjA1NzkyMzk3M30.s3IDgE3c4kpaiRhCpaKATKdaZzdlTb91heIhrwDZrU0";

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Export the client
const supabaseClient = supabase;

// Database operations for quiz module
const quizDb = {
  // Quiz operations
  quizzes: {
    // Create a new quiz
    async create(userId, title, sourceText) {
      const { data, error } = await supabaseClient
        .from("quizzes")
        .insert({
          user_id: userId,
          title: title,
          source_text: sourceText,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Get a quiz by id
    async get(quizId) {
      const { data, error } = await supabaseClient
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) throw error;
      return data;
    },

    // Get all quizzes for a user
    async getByUser(userId) {
      const { data, error } = await supabaseClient
        .from("quizzes")
        .select(
          `
          id, 
          title, 
          created_at,
          quiz_attempts (
            id,
            started_at,
            completed_at,
            score,
            is_completed,
            current_question
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  },

  // Questions operations
  questions: {
    // Create questions for a quiz
    async create(quizId, questions) {
      const questionRows = questions.map((question, index) => ({
        quiz_id: quizId,
        question_text: question.question,
        options: question.options,
        correct_answer: question.correctAnswer,
        question_order: index,
      }));

      const { data, error } = await supabaseClient
        .from("quiz_questions")
        .insert(questionRows)
        .select();

      if (error) throw error;
      return data;
    },

    // Get all questions for a quiz
    async getByQuiz(quizId) {
      const { data, error } = await supabaseClient
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("question_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  },

  // Attempts operations
  attempts: {
    // Create a new attempt
    async create(quizId, userId) {
      const { data, error } = await supabaseClient
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          user_id: userId,
          started_at: new Date().toISOString(),
          is_completed: false,
          current_question: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Get an attempt by id
    async get(attemptId) {
      const { data, error } = await supabaseClient
        .from("quiz_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (error) throw error;
      return data;
    },

    // Update attempt progress
    async updateProgress(attemptId, currentQuestion) {
      const { data, error } = await supabaseClient
        .from("quiz_attempts")
        .update({
          current_question: currentQuestion,
        })
        .eq("id", attemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Complete an attempt
    async complete(attemptId, score) {
      const { data, error } = await supabaseClient
        .from("quiz_attempts")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          score: score,
        })
        .eq("id", attemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // Answers operations
  answers: {
    // Save an answer
    async save(attemptId, questionId, userAnswer, isCorrect, isFlagged) {
      // First check if answer already exists
      const { data: existing, error: queryError } = await supabaseClient
        .from("quiz_answers")
        .select("id")
        .eq("attempt_id", attemptId)
        .eq("question_id", questionId)
        .maybeSingle();

      if (queryError) throw queryError;

      if (existing) {
        // Update existing answer
        const { data, error } = await supabaseClient
          .from("quiz_answers")
          .update({
            user_answer: userAnswer,
            is_correct: isCorrect,
            is_flagged: isFlagged,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new answer
        const { data, error } = await supabaseClient
          .from("quiz_answers")
          .insert({
            attempt_id: attemptId,
            question_id: questionId,
            user_answer: userAnswer,
            is_correct: isCorrect,
            is_flagged: isFlagged,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },

    // Get all answers for an attempt
    async getByAttempt(attemptId) {
      const { data, error } = await supabaseClient
        .from("quiz_answers")
        .select("*")
        .eq("attempt_id", attemptId);

      if (error) throw error;
      return data;
    },
  },
};
