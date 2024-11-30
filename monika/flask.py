import os
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello, Heroku!"

if __name__ == "__main__":
    # Use the PORT environment variable from Heroku or fallback to 5000
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))