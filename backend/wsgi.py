from app import create_app
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Create app instance
app = create_app()

if __name__ == "__main__":
    try:
        app.run(debug=True, host='0.0.0.0')
    except Exception as e:
        logging.error(f"Failed to start application: {str(e)}")
