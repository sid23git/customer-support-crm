import pytest
import httpx
import re

BASE_URL = "http://localhost:5000"

@pytest.fixture
def created_ticket():
    """
    Fixture that creates a ticket before the test runs,
    returns its generated ticket_id, and ensures successful creation.
    """
    payload = {
        "customer_name": "Fixture User",
        "customer_email": "fixture@test.com",
        "subject": "Okta SSO authentication failure",
        "description": "Fails validation checks when trying to complete login callback."
    }
    with httpx.Client() as client:
        response = client.post(f"{BASE_URL}/api/tickets", json=payload)
        assert response.status_code in (200, 201)
        data = response.json()
        assert "ticket_id" in data
        return data["ticket_id"]

def test_get_tickets_returns_list():
    """
    1. GET /api/tickets
    Assert response status is 200 and response is a JSON list.
    """
    with httpx.Client() as client:
        response = client.get(f"{BASE_URL}/api/tickets")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

def test_create_ticket():
    """
    2. POST /api/tickets
    Assert status code is successful, returns ticket_id starting with 'TKT-',
    and contains created_at.
    """
    payload = {
        "customer_name": "Test User",
        "customer_email": "test@test.com",
        "subject": "Test Subject",
        "description": "Test Description"
    }
    with httpx.Client() as client:
        response = client.post(f"{BASE_URL}/api/tickets", json=payload)
        assert response.status_code in (200, 201)
        data = response.json()
        assert "ticket_id" in data
        assert data["ticket_id"].startswith("TKT-")
        assert "created_at" in data

def test_ticket_id_format():
    """
    3. Assert ticket_id matches the regex pattern TKT-\\d{3}
    """
    payload = {
        "customer_name": "Test User",
        "customer_email": "test@test.com",
        "subject": "Test Subject",
        "description": "Test Description"
    }
    with httpx.Client() as client:
        response = client.post(f"{BASE_URL}/api/tickets", json=payload)
        assert response.status_code in (200, 201)
        data = response.json()
        ticket_id = data["ticket_id"]
        assert re.match(r"^TKT-\d{3}$", ticket_id)

def test_get_single_ticket(created_ticket):
    """
    4. GET /api/tickets/{ticket_id}
    Assert status 200 and details contain core properties + notes array.
    """
    with httpx.Client() as client:
        response = client.get(f"{BASE_URL}/api/tickets/{created_ticket}")
        assert response.status_code == 200
        data = response.json()
        assert "ticket_id" in data
        assert "customer_name" in data
        assert "customer_email" in data
        assert "subject" in data
        assert "description" in data
        assert "status" in data
        assert "notes" in data
        assert isinstance(data["notes"], list)

def test_get_invalid_ticket_returns_404():
    """
    5. GET /api/tickets/TKT-99999
    Assert status is 404.
    """
    with httpx.Client() as client:
        response = client.get(f"{BASE_URL}/api/tickets/TKT-99999")
        assert response.status_code == 404

def test_update_ticket_status(created_ticket):
    """
    6. PUT /api/tickets/{ticket_id} - status update
    Assert status 200 and field modification.
    """
    with httpx.Client() as client:
        # Update status
        update_payload = {
            "status": "In Progress"
        }
        response = client.put(f"{BASE_URL}/api/tickets/{created_ticket}", json=update_payload)
        assert response.status_code == 200
        assert response.json().get("success") is True
        
        # Verify changes
        response_get = client.get(f"{BASE_URL}/api/tickets/{created_ticket}")
        assert response_get.status_code == 200
        assert response_get.json()["status"] == "In Progress"

def test_add_note_to_ticket(created_ticket):
    """
    7. PUT /api/tickets/{ticket_id} - add note
    Assert note is stored in notes array.
    """
    with httpx.Client() as client:
        # Add comment note
        note_payload = {
            "note": "This is a test note"
        }
        response = client.put(f"{BASE_URL}/api/tickets/{created_ticket}", json=note_payload)
        assert response.status_code == 200
        
        # Verify details
        response_get = client.get(f"{BASE_URL}/api/tickets/{created_ticket}")
        assert response_get.status_code == 200
        notes = response_get.json()["notes"]
        assert len(notes) > 0
        assert any(n["note_text"] == "This is a test note" for n in notes)

def test_filter_by_status():
    """
    8. GET /api/tickets?status=Open
    Assert every item returned has status == 'Open'.
    """
    with httpx.Client() as client:
        response = client.get(f"{BASE_URL}/api/tickets", params={"status": "Open"})
        assert response.status_code == 200
        tickets = response.json()
        for ticket in tickets:
            assert ticket["status"] == "Open"

def test_search_functionality():
    """
    9. GET /api/tickets?search=UniqueSearchName
    Assert created ticket matches search queries.
    """
    unique_name = "UniqueSearchName"
    payload = {
        "customer_name": unique_name,
        "customer_email": "search@test.com",
        "subject": "Searching test ticket",
        "description": "Matches exact keyword criteria."
    }
    with httpx.Client() as client:
        # Create ticket
        response_create = client.post(f"{BASE_URL}/api/tickets", json=payload)
        assert response_create.status_code in (200, 201)
        ticket_id = response_create.json()["ticket_id"]
        
        # Query search matching unique name
        response_search = client.get(f"{BASE_URL}/api/tickets", params={"search": unique_name})
        assert response_search.status_code == 200
        results = response_search.json()
        assert len(results) > 0
        assert any(t["ticket_id"] == ticket_id for t in results)

def test_cors_headers():
    """
    10. GET /api/tickets with Origin header
    Assert CORS headers contain Access-Control-Allow-Origin response header.
    """
    headers = {
        "Origin": "http://localhost:5173"
    }
    with httpx.Client() as client:
        response = client.get(f"{BASE_URL}/api/tickets", headers=headers)
        assert response.status_code == 200
        # Check case insensitively
        cors_headers = {k.lower(): v for k, v in response.headers.items()}
        assert "access-control-allow-origin" in cors_headers
