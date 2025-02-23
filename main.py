from unittest.mock import Base
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from langchain_community.llms import DeepInfra
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field, validator
from langchain_openai import OpenAI
from typing import List
import os
import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq

load_dotenv()

class LessonStep(BaseModel):
    heading: str = Field(
            description="The title or heading of this step, summarizing the key concept or focus of the step in a clear and concise manner."
        )
    explanations: str = Field(
        description="A detailed and clear explanation string of the core concept being addressed in this particular explaining with visualization example. This should include key points or ideas that help the learner understand the topic in depth.."
    )
    visualization: str = Field(
        description="A comprehensive string description of visual aids, graphs, or diagrams relevant to this particular step explanation. The visualization should be precise and directly related to the concept to enhance understanding."
    )
    activity: str = Field(
        description="Engaging and interactive activities, exercises, or questions designed to help the learner practice or explore the concept for this particular step. These should encourage active participation and reinforce the learning objectives."
    )
#
# class LessonStep(BaseModel):
#     heading: str = Field(
#         description="The title or heading of this step, summarizing the key concept or focus of the step in a clear and concise manner."
#         )
#     explanations: str = Field(
#         description="Key points explaining the concept in this particular step."
#     )
#     visualization: str = Field(
#         description="Descriptions of actual precise visual aids or graphs for this particular step."
#     )
#     activity: str = Field(
#         description="Interactive activities or questions for this particular step."
#     )


class Topic(BaseModel):
    steps: List[LessonStep] = Field(
        description="A list of steps, each containing explanations, visualization, and activities."
    )

class Code(BaseModel):
    name:str = Field(description="The file name for the React component, including the .jsx extension (e.g., 'MyComponent.jsx').")
    code:str = Field( description="The complete source code for the React component written in JSX format.")

class Requestbobdy(BaseModel):
    user_message:str
    session_id:str

# Set OpenAI API key
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
llm = ChatOpenAI(model="gpt-4o")
chat = ChatGroq(temperature=0, groq_api_key=os.environ.get("GROQ_API_KEY"), model_name="llama-3.1-70b-versatile")

code = DeepInfra(model_id="meta-llama/Llama-2-70b-chat-hf")
code.model_kwargs = {
    "temperature": 0.7,
    "repetition_penalty": 1.2,
    "max_new_tokens": 250,
    "top_p": 0.9,
}
# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for your deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def get_chat_page(request: Request):
    """
    Render the main chat page.
    """
    return templates.TemplateResponse("chat.html", {"request": request})




@app.post("/send_message")
async def handle_user_message(req:Requestbobdy):
    """
    API endpoint to handle user input and return streaming response.
    """
    system_prompt = """You are Clara, that provides lessons in a structured format for teaching concepts, use Robert Gagné’s Nine Events of Instruction to engage and effectively explain topics to learners. Always aim to be clear, supportive, and adaptive to the student’s needs to ensure they feel confident and grasp the material effectively.
            Follow the exact structure defined below, and your response should always adhere to this format. Each step must include:

            Explanations: A list of points explaining the concept.
            Visualization: A list of points describing the visuals or graphs for the step.
            Activity: A list of interactive questions
            """
    parser = JsonOutputParser(pydantic_object=Topic)
    prompt = PromptTemplate(
                template="{system}\n{format_instructions}\n{query}\n",
                input_variables=["query"],
                partial_variables={"format_instructions": parser.get_format_instructions()},
            )
            ##############################################
            # And a query intended to prompt a language model to populate the data structure.
    prompt_and_model =  prompt | chat | parser
    output = prompt_and_model.invoke({"system":system_prompt,"query": req.user_message})

    ##COde generation
    # code_system ="""
    # # You are a React developer specializing in creating interactive components for visualizing mathematical concepts. Write a React component that uses Chart.js to dynamically plot graphs for any given mathematical function. The component should:

    # # Accept props for:

    # # width and height: Dimensions of the chart.
    # # Include interactivity:
    # # Users can hover to see point coordinates.
    # # Enable zooming and panning for detailed exploration.
    # # Change values for experimentation
    # # """
    # codes=[]
    # for  i in output["steps"]:
    #     print(i)
    #     completion =client.chat.completions.parse(
    #        model="gpt-4o",
    #        messages=[
    #            {"role": "system", "content": code_system},
    #            {"role": "user", "content":i["visualization"] },
    #        ],
    #        response_format=Code,
    #    )

    #     event = completion.choices[0].message.parsed
    #     codes.append(event)
    # output["code"] = codes
    # codeparser = JsonOutputParser(pydantic_object=Code)
    #
    # codeprompt = PromptTemplate(
    #             template="{system}\n{format_instructions}\n{query}\n",
    #             input_variables=["query"],
    #             partial_variables={"format_instructions": parser.get_format_instructions()},
    #         )
    # prompt_and_mode_codel =  codeprompt | chat | codeparser
    # for  i in output["steps"]:
    #     print(i)
    #     codeoutput = prompt_and_mode_codel.invoke({"system":code_system,"query":i["visualization"]})
    #     print(codeoutput)
    #     codes.append(codeoutput)
    # output["code"] = codes
    # print(codes)
    return output
