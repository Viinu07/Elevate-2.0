import sys
import os
# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core import security
import time

def test_token_logic():
    print("Testing Auth Logic...")
    data = {"sub": "test_user_id"}
    
    # 1. Create Token
    token = security.create_access_token(data)
    print(f"Generated Token: {token}")
    
    # 2. Verify Token
    payload = security.verify_access_token(token)
    print(f"Verified Payload: {payload}")
    
    if payload and payload["sub"] == "test_user_id":
        print("SUCCESS: Token logic is valid.")
    else:
        print("FAILURE: Token verification failed.")

if __name__ == "__main__":
    test_token_logic()
