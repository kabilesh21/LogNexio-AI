import requests
import os
from pathlib import Path
import time

BASE_URL = "http://127.0.0.1:8000"

def test_analysis():
    print("=== STARTING BACKEND ANALYSIS AND PARSING TESTS ===")
    
    # Create sample logs containing:
    # - Normal lines
    # - Java Stack Trace (NullPointerException)
    # - Python Exception (ValueError)
    # - Normal lines
    log_content = (
        "2026-07-30 11:00:00 INFO Initializing system...\n"
        "2026-07-30 11:00:01 INFO Database connected.\n"
        "2026-07-30 11:00:02 ERROR Exception in thread \"main\" java.lang.NullPointerException: Cannot invoke object\n"
        "\tat com.example.App.run(App.java:15)\n"
        "\tat com.example.App.main(App.java:8)\n"
        "Caused by: java.io.IOException: Low level read failure\n"
        "\tat com.example.Reader.read(Reader.java:23)\n"
        "\t... 5 more\n"
        "2026-07-30 11:00:03 INFO System running idle.\n"
        "2026-07-30 11:00:04 INFO User action triggered.\n"
        "2026-07-30 11:00:05 INFO Executing worker job...\n"
        "Traceback (most recent call last):\n"
        "  File \"worker.py\", line 45, in run\n"
        "    process_data(data)\n"
        "  File \"worker.py\", line 12, in process_data\n"
        "    raise ValueError(\"Invalid schema data structure\")\n"
        "ValueError: Invalid schema data structure\n"
        "2026-07-30 11:00:06 INFO Worker job finished with errors.\n"
        "2026-07-30 11:00:07 INFO Cleanup tasks complete.\n"
    )
    
    log_file = Path("test_analysis_sample.log")
    log_file.write_text(log_content, encoding="utf-8")
    
    try:
        # Step 1: Upload the log file
        print("\nStep 1: Uploading multi-exception log file...")
        with open(log_file, "rb") as f:
            res = requests.post(f"{BASE_URL}/api/upload", files={"file": (str(log_file), f, "text/plain")})
        print("Upload Status:", res.status_code)
        upload_data = res.json()
        assert res.status_code == 201
        file_id = upload_data["file_id"]
        print("Uploaded successfully. file_id:", file_id)
        
        # Step 2: Trigger Analysis
        print("\nStep 2: Triggering analysis for file_id...")
        t0 = time.time()
        res = requests.get(f"{BASE_URL}/api/analyze/{file_id}")
        t1 = time.time()
        print("Analysis Status:", res.status_code)
        analysis_data = res.json()
        print(f"Analysis completed in {t1 - t0:.4f}s")
        assert res.status_code == 200
        assert analysis_data["success"] is True
        assert analysis_data["file_id"] == file_id
        
        errors = analysis_data["errors"]
        print(f"Total incidents found: {analysis_data['total_errors']}")
        for idx, err in enumerate(errors):
            print(f"Incident {idx + 1}: Line {err['line_number']}, Type: {err['error_type']}, Severity: {err['severity']}")
            print("Error Block:")
            for line in err["error_block"]:
                print(f"  {line}")
        assert len(errors) == 2
        
        # Verify first incident (Java NullPointerException)
        print("\nChecking Incident 1 (Java NullPointerException)...")
        inc1 = errors[0]
        print("Error Type:", inc1["error_type"])
        print("Severity:", inc1["severity"])
        print("Line Number:", inc1["line_number"])
        assert inc1["error_type"] in ["NullPointerException", "IOException"]
        assert inc1["severity"] == "HIGH"
        assert inc1["line_number"] == 3
        assert len(inc1["context_before"]) == 2
        assert len(inc1["error_block"]) == 6 # starts with thread exception, finishes with "... 5 more"
        assert len(inc1["context_after"]) == 3 # 3 info lines between exception 1 and traceback
        
        # Verify second incident (Python ValueError)
        print("\nChecking Incident 2 (Python Traceback)...")
        inc2 = errors[1]
        print("Error Type:", inc2["error_type"])
        print("Severity:", inc2["severity"])
        print("Line Number:", inc2["line_number"])
        assert inc2["error_type"] == "ValueError"
        assert inc2["severity"] == "HIGH"
        assert inc2["line_number"] == 12
        print("Context Before Incident 2:", inc2["context_before"])
        assert len(inc2["context_before"]) == 3 or len(inc2["context_before"]) > 0
        assert len(inc2["error_block"]) == 6 # Traceback + 4 indented lines + exception line
        assert len(inc2["context_after"]) == 2 # 2 trailing info lines
        
        # Step 3: Verify Cache hit speed
        print("\nStep 3: Triggering analysis again to verify cache reuse...")
        t0 = time.time()
        res_cache = requests.get(f"{BASE_URL}/api/analyze/{file_id}")
        t1 = time.time()
        print(f"Cache response status: {res_cache.status_code}")
        print(f"Cache retrieval completed in {t1 - t0:.6f}s (Should be near 0s)")
        assert res_cache.status_code == 200
        assert res_cache.json() == analysis_data
        
        # Step 4: Verify retrieve single error detail endpoint
        incident_id = inc1["incident_id"]
        print(f"\nStep 4: Querying single incident API for incident_id: {incident_id}...")
        res_single = requests.get(f"{BASE_URL}/api/error/{incident_id}")
        print("Single Incident Status:", res_single.status_code)
        single_data = res_single.json()
        assert res_single.status_code == 200
        assert single_data["incident_id"] == incident_id
        assert single_data["error_type"] == inc1["error_type"]
        assert single_data["severity"] == inc1["severity"]
        assert single_data["context_before"] == inc1["context_before"]
        assert single_data["error_block"] == inc1["error_block"]
        assert single_data["context_after"] == inc1["context_after"]
        assert single_data["analysis_ready"] is True
        
        print("\n=== ALL ANALYSIS WORKFLOW SANITY CHECKS PASSED! ===")
        
    except AssertionError as e:
        print("\n[FAIL] Assertion check failed during analysis test.")
        raise e
    except Exception as e:
        print("\n[FAIL] Test encountered unhandled exception.")
        raise e
    finally:
        if log_file.exists():
            log_file.unlink()

if __name__ == "__main__":
    test_analysis()
