import hmac
import hashlib
import base64
import json
import time
from typing import Optional
from app.core.config import settings

def create_access_token(data: dict, expires_delta: int = 3600 * 24 * 7) -> str:
    """
    Create a secure HMAC-SHA256 signed token.
    Format: base64(json(data)).base64(signature)
    """
    to_encode = data.copy()
    to_encode.update({"exp": int(time.time()) + expires_delta})
    
    # Encode payload
    json_str = json.dumps(to_encode, separators=(",", ":"))
    payload = base64.urlsafe_b64encode(json_str.encode()).decode().rstrip("=")
    
    # Sign payload
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256
    ).digest()
    sig_str = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{payload}.{sig_str}"



def verify_access_token(token: str) -> Optional[dict]:
    """
    Verify and decode the token. Returns the payload dict if valid, else None.
    """
    try:
        # print(f"DEBUG: Verifying token: {token}") # Uncomment for verbose
        if "." not in token:
            print("Token verification failed: No dot found")
            return None
            
        payload, sig_str = token.rsplit(".", 1)
        
        # Verify signature
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode(),
            payload.encode(),
            hashlib.sha256
        ).digest()
        
        decoded_sig = base64.urlsafe_b64decode(sig_str + "=" * (-len(sig_str) % 4))
        
        if not hmac.compare_digest(decoded_sig, expected_sig):
            print(f"Token verification failed: Signature mismatch. Expected {expected_sig.hex()[:8]}... Got {decoded_sig.hex()[:8]}...")
            return None
            
        # Decode payload
        json_str = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)).decode()
        data = json.loads(json_str)
        
        # Check expiration
        if "exp" in data and data["exp"] < time.time():
            print(f"Token verification failed: Expired. Exp: {data['exp']}, Now: {time.time()}")
            return None
            
        return data
    except Exception as e:
        print(f"Token verification error: {e}")
        return None
