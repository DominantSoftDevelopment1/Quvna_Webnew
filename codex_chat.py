import os
import json
from openai import OpenAI

# ==================== SOZLAMALAR ====================
API_KEY = "sk-3b15119bcb99fec6-81d3d8-e68c9416"
BASE_URL = "http://localhost:20128/v1"
MODEL = "cx/gpt-5.4"
# ====================================================

os.environ['OPENAI_API_KEY'] = API_KEY
os.environ['OPENAI_BASE_URL'] = BASE_URL

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

print("=" * 50)
print("🤖 CODEX CHAT - Local Host")
print(f"📡 Server: {BASE_URL}")
print(f"🧠 Model: {MODEL}")
print("=" * 50)
print("💬 Buyruqlar:")
print("   'exit'  - Chiqish")
print("   'clear' - Dialogni tozalash")
print("   'save'  - Dialogni faylga saqlash")
print("=" * 50)

messages = []
chat_history = []

while True:
    user_input = input("\n👤 Siz: ").strip()
    
    if user_input.lower() == 'exit':
        print("👋 Xayr! Goodbye!")
        break
    
    elif user_input.lower() == 'clear':
        messages = []
        chat_history = []
        print("✅ Dialogni tozalandi")
        continue
    
    elif user_input.lower() == 'save':
        if chat_history:
            filename = f"chat_history_{len(chat_history)}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(chat_history, f, ensure_ascii=False, indent=2)
            print(f"💾 Dialog saqlandi: {filename}")
        else:
            print("⚠️ Hech qanday dialog yo'q")
        continue
    
    if not user_input:
        continue
    
    messages.append({"role": "user", "content": user_input})
    
    print("🤖 Codex: ", end="", flush=True)
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
            temperature=0.7
        )
        
        full_response = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                print(content, end="", flush=True)
                full_response += content
        
        print()
        messages.append({"role": "assistant", "content": full_response})
        
        # Saqlash uchun
        chat_history.append({
            "user": user_input,
            "assistant": full_response
        })
        
    except Exception as e:
        print(f"\n❌ Xato: {e}")
        print("💡 OmniRoute ishlayotganligini tekshiring!")
        messages.pop()  # Xato bo'lsa user xabarni olib tashlash