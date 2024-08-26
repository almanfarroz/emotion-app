from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline

path = r"mihsan2903/QnAMentalHealthNLP"

# Load the tokenizer and model
tokenizer_emb = AutoTokenizer.from_pretrained(path)
model_emb = AutoModelForQuestionAnswering.from_pretrained(path)

# Initialize the question-answering pipeline
qa = pipeline('question-answering', model=model_emb, tokenizer=tokenizer_emb)

def get_answers(context, question):
    # Use the pipeline to get answers
    result = qa(context=context, question=question)

    # Extract the best answer and its probability
    best_answer = result['answer'].strip()
    best_prob = result['score']

    probabilities = best_prob
    answers = best_answer
    return answers, probabilities