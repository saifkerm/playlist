import { FormEvent, useMemo, useState } from 'react';
import { QuizQuestion } from '../../types';

type QuizCardProps = {
  videoId: string;
  questions: QuizQuestion[];
  initialScore?: { score: number; total: number };
  onSubmit: (score: number, total: number) => void;
};

export const QuizCard = ({ videoId, questions, initialScore, onSubmit }: QuizCardProps): JSX.Element => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState(initialScore ?? null);

  const allAnswered = useMemo(
    () => questions.every((question) => answers[question.id] !== undefined),
    [questions, answers]
  );

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!allAnswered) {
      return;
    }

    const score = questions.reduce((acc, question) => {
      return acc + (answers[question.id] === question.correctIndex ? 1 : 0);
    }, 0);

    const payload = { score, total: questions.length };
    setResult(payload);
    onSubmit(payload.score, payload.total);
  };

  return (
    <section className="quiz-card" aria-labelledby={`quiz-${videoId}`}>
      <h3 id={`quiz-${videoId}`}>Quiz rapide (3 questions)</h3>
      <form onSubmit={submit}>
        {questions.map((question) => (
          <fieldset key={question.id} className="quiz-question">
            <legend>{question.question}</legend>
            {question.options.map((option, index) => (
              <label key={option} className="quiz-option">
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === index}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        ))}

        <button className="quiz-submit" type="submit" disabled={!allAnswered}>
          Valider le quiz
        </button>
      </form>

      {result ? (
        <p className="quiz-result" role="status">
          Score: {result.score}/{result.total}
        </p>
      ) : null}
    </section>
  );
};
