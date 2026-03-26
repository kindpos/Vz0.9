import requests
import json

def verify_all():
    base_url = "http://127.0.0.1:8000/overseer"
    
    # 1. Check sidebar-nav.js for forced styles
    print("Checking sidebar-nav.js...")
    try:
        r = requests.get(f"{base_url}/src/components/sidebar-nav.js")
        if r.status_code == 200:
            content = r.text
            if 'height="32"' in content and 'style="height: 32px; width: auto; max-height: 32px; object-fit: contain; flex-shrink: 0;"' in content:
                print("  [OK] Palm logo has forced height attributes and inline styles.")
            else:
                print("  [FAIL] Palm logo is missing forced attributes/styles.")
                
            if 'style="display: flex; flex-direction: row; align-items: center; gap: 8px; padding: 12px 16px;"' in content:
                print("  [OK] Sidebar header has forced flex styles.")
            else:
                print("  [FAIL] Sidebar header is missing forced flex styles.")
        else:
            print(f"  [ERROR] Status {r.status_code} fetching sidebar-nav.js")
    except Exception as e:
        print(f"  [ERROR] {e}")

    # 2. Check win98.css for button width
    print("\nChecking win98.css...")
    try:
        r = requests.get(f"{base_url}/styles/win98.css")
        if r.status_code == 200:
            content = r.text
            if 'padding: 8px 40px;' in content and 'min-width: 120px;' in content:
                print("  [OK] Button styles (padding 40px, min-width 120px) found.")
            else:
                print("  [FAIL] Button styles are incorrect.")
        else:
            print(f"  [ERROR] Status {r.status_code} fetching win98.css")
    except Exception as e:
        print(f"  [ERROR] {e}")

    # 3. Check if app is alive
    print("\nChecking index.html...")
    try:
        r = requests.get(f"{base_url}/")
        if r.status_code == 200:
            print("  [OK] index.html served.")
        else:
            print(f"  [ERROR] Status {r.status_code} fetching index.html")
    except Exception as e:
        print(f"  [ERROR] {e}")

if __name__ == "__main__":
    verify_all()
