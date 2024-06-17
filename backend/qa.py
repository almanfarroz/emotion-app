from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, QuestionAnsweringPipeline

# Load the model and tokenizer
qa_pipeline: QuestionAnsweringPipeline = pipeline("question-answering", model="./model", tokenizer="./model")

# API Input Schema
class QAInput(BaseModel):
    question: str
    context: str

# API Route
def predict_qa(qa_input: QAInput):
    result = qa_pipeline(question=qa_input.question, context=qa_input.context)
    return result
