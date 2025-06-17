from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from datetime import datetime,timezone
from bson.objectid import ObjectId
from bson.json_util import dumps
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Configure MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
db = mongo.db

@app.route('/api/register', methods=['POST'])
def register_member():
    try:
        data = request.get_json()
        
        # Required fields validation
        required_fields = ['firstName', 'lastName', 'phone', 'email', 'dob']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        
        # Create member document
        member = {
            "firstName": data['firstName'],
            "lastName": data['lastName'],
            "phone": data['phone'],
            "email": data['email'],
            "dob": datetime.strptime(data['dob'], '%Y-%m-%d'),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        
        # Insert into MongoDB
        result = db.members.insert_one(member)
        
        return jsonify({
            "message": "Registration successful!",
            "id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)