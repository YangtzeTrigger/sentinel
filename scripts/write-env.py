import os

token = os.environ.get('DISCORD_TOKEN', '')
app_id = os.environ.get('APPLICATION_ID', '')
anthropic_key = os.environ.get('ANTHROPIC_API_KEY', '')

with open('/opt/sentinel/.env', 'w') as f:
    f.write(f"DISCORD_TOKEN={token}\n")
    f.write(f"APPLICATION_ID={app_id}\n")
    f.write(f"ANTHROPIC_API_KEY={anthropic_key}\n")
print("Done")
