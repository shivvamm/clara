from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
import os
import asyncio
from dotenv import load_dotenv
load_dotenv()
# Set OpenAI API key
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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
async def handle_user_message(user_message: str = Form(...)):
    """
    API endpoint to handle user input and return streaming response.
    """
    async def generate_response():
        try:
            system_prompt = "A helpful assistant"
            # Send a "system" role prompt along with user input
            messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_message}]

            # Call OpenAI API with streaming enabled
            response =  client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                stream=True
            )
            print(response)
            # Stream tokens as they arrive
            for chunk in response:
                delta = chunk.choices[0].delta
                content = delta.content
                if content:
                # if "content" in delta:
                    yield f"data: {delta.content}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(generate_response(), media_type="text/event-stream")
