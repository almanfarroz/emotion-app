# qa.py
from simpletransformers.question_answering import QuestionAnsweringModel

model_type = "bert"
saved_model_dir = "qa"

# Load the model
model = QuestionAnsweringModel(model_type, saved_model_dir, use_cuda=False)

def get_answers(context, question):
    to_predict = [
        {
            "context": context,
            "qas": [
                {
                    "question": question,
                    "id": "1",
                }
            ],
        }
    ]

    answers, probabilities = model.predict(to_predict)
    return answers, probabilities