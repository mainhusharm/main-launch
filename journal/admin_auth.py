from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
import os
import logging

admin_auth_bp = Blueprint('admin_auth_bp', __name__)

# Setup logging
logging.basicConfig(level=logging.INFO)

@admin_auth_bp.route('/validate-token', methods=['POST'])
@jwt_required()
def validate_token():
    return jsonify(success=True), 200

@admin_auth_bp.route('/mpin-auth', methods=['POST'])
def admin_mpin_auth():
    data = request.get_json()
    mpin = data.get('mpin')

    logging.info(f"Admin M-PIN authentication attempt")

    if not mpin:
        logging.warning("Admin M-PIN attempt with missing M-PIN.")
        return jsonify({"msg": "Missing M-PIN"}), 400

    # Admin M-PIN is 180623
    if mpin == '180623':
        logging.info(f"Admin M-PIN authentication successful")
        access_token = create_access_token(identity='admin', expires_delta=False)
        return jsonify(access_token=access_token), 200
    
    logging.warning(f"Failed admin M-PIN attempt")
    return jsonify({"msg": "Invalid M-PIN"}), 401