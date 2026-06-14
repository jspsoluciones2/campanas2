from flask import Flask, jsonify

from app.api.health import health_bp
from app.api.platform import platform_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        JSON_SORT_KEYS=False,
    )

    @app.get("/")
    def root():
        return jsonify(
            {
                "service": "plataforma-campanas-api",
                "status": "ok",
                "ui": "http://localhost:3000",
                "health": "/api/health",
            }
        )

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(platform_bp, url_prefix="/api")
    return app
