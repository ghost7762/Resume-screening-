from flask_jwt_extended import JWTManager
from flask_cors import CORS
import mongoengine as me

# Initialize extensions
jwt = JWTManager()
cors = CORS()

# MongoDB will be connected in app.py
