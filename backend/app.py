from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from datetime import datetime, timezone
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv
import logging


# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5500,http://127.0.0.1:5500').split(',')
MONGO_URI = os.getenv("MONGO_URI")

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    },
    r"/admin/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Configure MongoDB
app.config["MONGO_URI"] = MONGO_URI
mongo = PyMongo(app)
db = mongo.db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helper Functions
def add_cors_headers(response):
    """Add CORS headers to the response"""
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

def serialize_member(member):
    """Serialize MongoDB document to JSON-friendly format"""
    if '_id' in member:
        member['_id'] = str(member['_id'])
    if 'dob' in member:
        member['dob'] = member['dob'].strftime('%Y-%m-%d')
    if 'createdAt' in member:
        member['createdAt'] = member['createdAt'].strftime('%Y-%m-%d %H:%M:%S')
    if 'updatedAt' in member:
        member['updatedAt'] = member['updatedAt'].strftime('%Y-%m-%d %H:%M:%S')
    return member

def build_search_query(fname, lname, email, phone):
    """Build MongoDB query from search parameters"""
    query = {}
    
    # Name conditions
    name_conditions = []
    if fname:
        name_conditions.append({'firstName': {'$regex': fname, '$options': 'i'}})
    if lname:
        name_conditions.append({'lastName': {'$regex': lname, '$options': 'i'}})
    
    if name_conditions:
        query['$or'] = name_conditions
    
    # Email condition
    if email:
        query['email'] = {'$regex': f'^{email}$', '$options': 'i'}
    
    # Phone condition
    if phone:
        query['phone'] = phone
    
    return query

# Routes
@app.route('/api/register', methods=['POST'])
def register_member():
    """Register a new member"""
    try:
        data = request.get_json()
        
        # Required fields validation
        required_fields = [
            'firstName', 'lastName', 'phone', 'email', 'dob',
            'parentsName', 'aadhar', 'occupation', 'organization',
            'currentAddress', 'permanentAddress', 'art', 'sports', 'music',
            'technology', 'literature', 'science', 'reason'
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        
        # Create member document
        member = {
            "firstName": data['firstName'],
            "middleName": data.get('middleName', ''),
            "lastName": data['lastName'],
            "parentsName": data['parentsName'],
            "phone": data['phone'],
            "email": data['email'],
            "dob": datetime.strptime(data['dob'], '%Y-%m-%d'),
            "aadhar": data['aadhar'],
            "occupation": data['occupation'],
            "organization": data['organization'],
            "currentAddress": data['currentAddress'],
            "permanentAddress": data['permanentAddress'],
            "art": int(data['art']),
            "sports": int(data['sports']),
            "music": int(data['music']),
            "technology": int(data['technology']),
            "literature": int(data['literature']),
            "science": int(data['science']),
            "reason": data['reason'],
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        
        # Insert into MongoDB
        result = db.members.insert_one(member)
        
        response = jsonify({
            "message": "Registration successful!",
            "id": str(result.inserted_id)
        })
        response = add_cors_headers(response)
        return response, 201
        
    except Exception as e:
        logger.error(f"Error in register_member: {str(e)}", exc_info=True)
        response = jsonify({"error": str(e)})
        response = add_cors_headers(response)
        return response, 500

@app.route('/api/members', methods=['GET', 'OPTIONS'])
def query_members():
    """Handle member search requests"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'message': 'Preflight request accepted'})
        response = add_cors_headers(response)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response, 200

    try:
        # Get and validate query parameters
        search_fname = request.args.get('searchFName', '').strip()
        search_lname = request.args.get('searchLName', '').strip()
        search_email = request.args.get('searchEmail', '').strip()
        search_phone = request.args.get('searchPhone', '').strip()

        # Build query
        query = build_search_query(
            search_fname, 
            search_lname, 
            search_email, 
            search_phone
        )

        # Execute query
        members = list(db.members.find(query).sort("createdAt", -1).limit(100))  # Added limit for safety
        
        # Serialize results
        serialized_members = [serialize_member(m) for m in members]
        
        # Prepare response
        response = jsonify(serialized_members)
        response = add_cors_headers(response)
        return response, 200

    except Exception as e:
        logger.error(f"Error in query_members: {str(e)}", exc_info=True)
        response = jsonify({
            "error": "An error occurred while processing your request",
            "details": str(e)
        })
        response = add_cors_headers(response)
        return response, 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"}), 200

from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    # Query from the "admin_credentials" collection
    admin = db.admin_credentials.find_one({'username': username})

    if not admin:
        return jsonify({"message": "Invalid username"}), 401

    # Check the password using bcrypt
    if not bcrypt.check_password_hash(admin['password'], password):
        return jsonify({"message": "Incorrect password"}), 401

    return jsonify({"message": "Login successful", "token": "admin-token"}), 200

@app.route('/api/members/<id>', methods=['PUT'])
def update_member(id):
    try:
        data = request.get_json()
        update_fields = {
            "phone": data.get("phone"),
            "email": data.get("email"),
            "currentAddress": data.get("currentAddress"),
            "permanentAddress": data.get("permanentAddress"),
            "reason": data.get("reason"),
            "updatedAt": datetime.now(timezone.utc)
        }

        # Remove None values to avoid overwriting fields with null
        update_fields = {k: v for k, v in update_fields.items() if v is not None}

        result = db.members.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return jsonify({"message": "Member not found"}), 404

        return jsonify({"message": "Member updated successfully"}), 200

    except Exception as e:
        logger.error(f"Error updating member: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)