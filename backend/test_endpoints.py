import requests
import os
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("=== STARTING BACKEND ENDPOINT SANITY CHECKS ===")
    
    # 1. Create dummy files
    log_file = Path("test_sample.log")
    txt_file = Path("test_sample.txt")
    invalid_file = Path("test_sample.pdf")
    
    log_file.write_text("line 1\nline 2\nline 3\nline 4\nline 5\n", encoding="utf-8")
    txt_file.write_text("txt line 1\ntxt line 2\n", encoding="utf-8")
    invalid_file.write_text("PDF mock header", encoding="utf-8")
    
    try:
        # Check if server is running
        print("Checking server status...")
        res = requests.get(f"{BASE_URL}/")
        print("Server status response:", res.json())
        
        # Test 1: Upload Valid Log File
        print("\nTest 1: Uploading valid log file...")
        with open(log_file, "rb") as f:
            res = requests.post(f"{BASE_URL}/api/upload", files={"file": (str(log_file), f, "text/plain")})
        print("Status Code:", res.status_code)
        upload_data = res.json()
        print("Response:", upload_data)
        assert res.status_code == 201
        assert upload_data["success"] is True
        assert upload_data["total_lines"] == 5
        assert upload_data["status"] == "uploaded"
        file_id = upload_data["file_id"]
        
        # Test 2: Upload Valid Txt File
        print("\nTest 2: Uploading valid txt file...")
        with open(txt_file, "rb") as f:
            res = requests.post(f"{BASE_URL}/api/upload", files={"file": (str(txt_file), f, "text/plain")})
        print("Status Code:", res.status_code)
        print("Response:", res.json())
        assert res.status_code == 201
        assert res.json()["total_lines"] == 2
        
        # Test 3: Upload Invalid extension (.pdf)
        print("\nTest 3: Uploading invalid file extension (.pdf)...")
        with open(invalid_file, "rb") as f:
            res = requests.post(f"{BASE_URL}/api/upload", files={"file": (str(invalid_file), f, "application/pdf")})
        print("Status Code:", res.status_code)
        print("Response:", res.json())
        assert res.status_code == 400
        assert res.json()["success"] is False
        assert "Unsupported file format" in res.json()["message"]

        # Test 4: Retrieve Metadata of uploaded file
        print(f"\nTest 4: Retrieving metadata for file_id: {file_id}...")
        res = requests.get(f"{BASE_URL}/api/upload/{file_id}")
        print("Status Code:", res.status_code)
        meta_data = res.json()
        print("Response:", meta_data)
        assert res.status_code == 200
        assert meta_data["file_id"] == file_id
        assert meta_data["total_lines"] == 5
        assert meta_data["status"] == "uploaded"
        
        # Test 5: Retrieve Non-existent Metadata
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        print(f"\nTest 5: Retrieving metadata for non-existent ID: {fake_uuid}...")
        res = requests.get(f"{BASE_URL}/api/upload/{fake_uuid}")
        print("Status Code:", res.status_code)
        print("Response:", res.json())
        assert res.status_code == 404
        assert res.json()["success"] is False
        
        print("\n=== ALL ENDPOINT SANITY CHECKS PASSED SUCCESSFULLY! ===")
        
    except AssertionError as e:
        print("\n[FAIL] Assertion check failed during API tests.")
        raise e
    except Exception as e:
        print("\n[FAIL] Request failed. Is the server running?")
        raise e
    finally:
        # Clean up local dummy test files
        for p in [log_file, txt_file, invalid_file]:
            if p.exists():
                p.unlink()

if __name__ == "__main__":
    test_api()
