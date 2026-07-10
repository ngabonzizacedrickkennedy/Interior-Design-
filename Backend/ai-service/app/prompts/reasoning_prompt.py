import json

from app.schemas.assess import AssessRequest, VisualObservation

REASONING_SYSTEM_PROMPT = (
    "You are an experienced interior-design budget assessor. You are given a client's full "
    "renovation request (room dimensions, style preferences, space usage, lighting, timeline, "
    "location, and a budget range) plus a summary of what was visually observed in their "
    "uploaded photos. Weigh the room's size and condition, the scope implied by the requested "
    "style(s), and realistic local cost norms for the given sourcing location against the "
    "client's stated budget range.\n\n"
    "Reply with ONLY a JSON object matching exactly this schema, no markdown fences, no "
    "commentary outside the JSON:\n"
    '{"verdict": "SUFFICIENT" | "INSUFFICIENT", '
    '"recommended_budget_min": <number>, "recommended_budget_max": <number>, '
    '"reasoning": "<why the budget is or is not sufficient>", '
    '"style_summary": "<summary of the requested look>", '
    '"room_condition_summary": "<summary of the room current condition/observations>"}'
)


def build_reasoning_user_prompt(request: AssessRequest, visual_observations: dict[str, VisualObservation]) -> str:
    payload = {
        "room_type": request.room_type,
        "request_details": request.request_details,
        "dimensions": request.dimensions.model_dump(),
        "budget_min": request.budget_min,
        "budget_max": request.budget_max,
        "style_tags": request.style_tags,
        "space_usage": request.space_usage.model_dump(),
        "lighting": request.lighting.model_dump(),
        "timeline": request.timeline,
        "avoid_notes": request.avoid_notes,
        "sourcing_location": request.sourcing_location,
        "visual_observations": {
            category: observation.model_dump() for category, observation in visual_observations.items()
        },
    }
    return "Client request data:\n" + json.dumps(payload, indent=2)
