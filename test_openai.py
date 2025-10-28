import os
from openai import OpenAI

# Load API key from .env
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
print(f"API Key loaded: {api_key[:20]}..." if api_key else "No API key found")

client = OpenAI(api_key=api_key)

print("\nTesting OpenAI API...")
print("=" * 50)

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello in one word"}
        ],
        max_tokens=10
    )
    
    print("\n✅ SUCCESS!")
    print(f"Response: {response.choices[0].message.content}")
    print(f"Model: {response.model}")
    print(f"Tokens used: {response.usage.total_tokens}")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print(f"Error type: {type(e).__name__}")

