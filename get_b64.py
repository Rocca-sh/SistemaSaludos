import base64

with open("logo/png-transparent-autozone-logo-icons-logos-emojis-car-logos.png", "rb") as f:
    encoded = base64.b64encode(f.read()).decode('utf-8')

with open("wwwroot/logo.b64", "w", encoding="utf-8") as f:
    f.write(encoded)
