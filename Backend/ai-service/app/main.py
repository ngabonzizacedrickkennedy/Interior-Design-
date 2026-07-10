import logging

from fastapi import FastAPI

from app.routers import assess, chat, cv, health, interview, portfolio, project_assessment, stage

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Interior Design AI Service")

app.include_router(health.router)
app.include_router(assess.router)
app.include_router(chat.router)
app.include_router(cv.router)
app.include_router(interview.router)
app.include_router(portfolio.router)
app.include_router(project_assessment.router)
app.include_router(stage.router)
