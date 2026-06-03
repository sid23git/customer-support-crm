import urllib.request
import json
import time

url = "http://localhost:5000/api/tickets"

print("--- Starting Backend API Verification Tests ---")

# 1. Create a support ticket
data = {
    "customer_name": "Sarah Jenkins",
    "customer_email": "sarah@acme.com",
    "subject": "Unable to access billing dashboard",
    "description": "Getting a 403 Forbidden error when trying to access the team invoices page. My user role is Admin."
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req) as res:
        response = json.loads(res.read().decode("utf-8"))
        print("\n1. POST /api/tickets -> SUCCESS")
        print("Response:", response)
        ticket_id = response["ticket_id"]
except Exception as e:
    print("\n1. POST /api/tickets -> FAILED")
    print(e)
    exit(1)

# 2. Get tickets list
try:
    with urllib.request.urlopen(url) as res:
        response = json.loads(res.read().decode("utf-8"))
        print("\n2. GET /api/tickets (list) -> SUCCESS")
        print("List count:", len(response))
        print("First entry:", response[0] if response else "None")
except Exception as e:
    print("\n2. GET /api/tickets (list) -> FAILED")
    print(e)
    exit(1)

# 3. Get single ticket details
try:
    with urllib.request.urlopen(f"{url}/{ticket_id}") as res:
        response = json.loads(res.read().decode("utf-8"))
        print(f"\n3. GET /api/tickets/{ticket_id} (details) -> SUCCESS")
        print("Subject:", response.get("subject"))
        print("Status:", response.get("status"))
        print("Notes count:", len(response.get("notes", [])))
except Exception as e:
    print(f"\n3. GET /api/tickets/{ticket_id} (details) -> FAILED")
    print(e)
    exit(1)

# 4. PUT updates (status change and comment creation)
update_data = {
    "status": "In Progress",
    "note": "Assigned to the engineering team. Checking user privilege definitions."
}
req_put = urllib.request.Request(
    f"{url}/{ticket_id}",
    data=json.dumps(update_data).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="PUT"
)
try:
    with urllib.request.urlopen(req_put) as res:
        response = json.loads(res.read().decode("utf-8"))
        print(f"\n4. PUT /api/tickets/{ticket_id} (update) -> SUCCESS")
        print("Response:", response)
except Exception as e:
    print(f"\n4. PUT /api/tickets/{ticket_id} (update) -> FAILED")
    print(e)
    exit(1)

# 5. Fetch single ticket details again to verify notes are appended
try:
    with urllib.request.urlopen(f"{url}/{ticket_id}") as res:
        response = json.loads(res.read().decode("utf-8"))
        print(f"\n5. GET /api/tickets/{ticket_id} (post-update verify) -> SUCCESS")
        print("New Status:", response.get("status"))
        print("Notes:", response.get("notes"))
except Exception as e:
    print(f"\n5. GET /api/tickets/{ticket_id} (post-update verify) -> FAILED")
    print(e)
    exit(1)

print("\n--- All Backend API Verification Tests Completed Successfully ---")
