from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .extensions import db, socketio
from .routes import trades_bp, risk_plan_bp, plan_generation_bp
from .auth import auth_bp
from .user_routes import user_bp
from .admin_auth import admin_auth_bp
from .telegram_routes import telegram_bp
from .account_routes import account_bp
import os
from dotenv import load_dotenv

def create_app(config_object='journal.config.DevelopmentConfig'):
    load_dotenv()
    app = Flask(__name__, static_folder='../dist', static_url_path='')
    app.config.from_object(config_object)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, resources={r"/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})
    socketio.init_app(app, cors_allowed_origins=app.config.get("CORS_ORIGINS", "*"))

    # Add OPTIONS method handler for CORS preflight
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response

    # Add method not allowed handler
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "error": "Method not allowed",
            "message": f"The method {request.method} is not allowed for this endpoint",
            "allowed_methods": error.description if hasattr(error, 'description') else []
        }), 405

    # Add 404 handler
    @app.errorhandler(404)
    def not_found(error):
        # Check if it's an API request
        if request.path.startswith('/api/'):
            return jsonify({
                "error": "Not found",
                "message": f"The endpoint {request.path} was not found"
            }), 404
        # For non-API requests, serve the frontend
        return send_from_directory(app.static_folder, 'index.html')

    # Add 422 handler
    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({
            "error": "Unprocessable entity",
            "message": "The request was well-formed but was unable to be followed due to semantic errors"
        }), 422

    # Add 500 handler
    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred on the server"
        }), 500
    # Register blueprints
    app.register_blueprint(trades_bp, url_prefix='/api')
    app.register_blueprint(risk_plan_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(admin_auth_bp, url_prefix='/api/admin')
    app.register_blueprint(telegram_bp, url_prefix='/api/telegram')
    app.register_blueprint(plan_generation_bp, url_prefix='/api')
    app.register_blueprint(account_bp, url_prefix='/api/accounts')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        # Skip API routes - let them be handled by blueprints
        if path.startswith('api/'):
            return jsonify({"error": "API endpoint not found"}), 404
            
        if app.static_folder is None:
            raise RuntimeError("Static folder is not configured.")
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    # Database tables are created via create_db.py


    return app

def create_production_app():
    return create_app('journal.config.ProductionConfig')
