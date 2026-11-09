import groq
from django.conf import settings

SOURCE_LIMIT = 3000

SYSTEM_PROMPT = (
    "You write short fact posts for a social feed. General idea here is that this app will function like Instagram in terms of display, but the contents need to be somewhat elevated in terms of academia or learning, meaning that instead of browsing pointless memes or posts all day, you get to read through posts that teach you something regarding a specific field chosen by the user, this is where you come in in generating that post to make it as easily learnable by the user. "
    "Rules: "
    "1. Write 2 or 3 sentences, under 300 characters total. "
    "2. Use ONLY facts stated in the provided text. Never add outside knowledge. "
    "3. Copy every number and date exactly as written in the text. "
    "4. Pick the most surprising or interesting facts. "
    "5. Do not start with 'Did you know'. No hashtags, no emojis. "
    "6. Output only the post text, nothing else."
)


def rewrite_fact(title, text):
    client = groq.Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        temperature=0.3,
        reasoning_effort='low',
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': f'Title: {title}\n\nText:\n{text[:SOURCE_LIMIT]}'},
        ],
    )
    return (response.choices[0].message.content or '').strip()