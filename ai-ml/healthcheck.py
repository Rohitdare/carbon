"""
Health check script for the AI/ML service
"""

import requests
import sys
import time

def check_health():
    """Check if the AI/ML service is healthy"""
    try:
        # Try to connect to the health endpoint
        response = requests.get("http://localhost:8000/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print("AI/ML Service is healthy")
                return True
            else:
                print(f"AI/ML Service is unhealthy: {data}")
                return False
        else:
            print(f"AI/ML Service returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"Failed to connect to AI/ML Service: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    # Wait a bit for the service to start
    time.sleep(5)
    
    # Check health
    if check_health():
        sys.exit(0)
    else:
        sys.exit(1)

