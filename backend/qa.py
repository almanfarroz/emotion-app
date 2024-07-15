# qa.py
from huggingface_hub import HfApi, HfFolder
from simpletransformers.question_answering import QuestionAnsweringModel

# Masukkan token API Anda di sini
hf_token = "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"

# Login menggunakan token API
HfFolder.save_token(hf_token)
model_type = "roberta"
saved_model_dir = "mihsan2903/QnAMentalHealthNLP"

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

    best_answer = answers[0]['answer'][0].strip()
    best_prob = probabilities[0]['probability'][0]

    probabilities = best_prob
    answers = best_answer
    return answers, probabilities