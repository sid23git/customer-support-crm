from fastapi import APIRouter, HTTPException, Query, status
from typing import List
import sqlite3
import uuid
import datetime
from database import get_db_connection
from models import (
    TicketCreate, 
    TicketCreateResponse, 
    TicketListItem, 
    TicketDetailResponse, 
    TicketUpdate, 
    TicketUpdateResponse
)

router = APIRouter()

@router.post("/tickets", response_model=TicketCreateResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate):
    """
    1. POST /api/tickets
    Creates a new support ticket. To satisfy the UNIQUE NOT NULL ticket_id constraint,
    we insert using a temporary UUID, retrieve the primary key id (lastrowid), generate the
    ticket_id in TKT-00X format, and update the row with the generated value.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Temp ID placeholder
        temp_id = f"TEMP-{uuid.uuid4()}"
        
        cursor.execute(
            """
            INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description)
            VALUES (?, ?, ?, ?, ?)
            """,
            (temp_id, ticket.customer_name, ticket.customer_email, ticket.subject, ticket.description)
        )
        
        last_id = cursor.lastrowid
        ticket_id = f"TKT-{last_id:03d}"
        
        # Update row to set ticket_id to the generated value
        cursor.execute(
            "UPDATE tickets SET ticket_id = ? WHERE id = ?",
            (ticket_id, last_id)
        )
        
        # Retrieve created_at
        cursor.execute("SELECT created_at FROM tickets WHERE id = ?", (last_id,))
        created_at = cursor.fetchone()["created_at"]
        
        conn.commit()
        return {"ticket_id": ticket_id, "created_at": created_at}
        
    except sqlite3.Error as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database insertion failed: {str(e)}"
        )
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during ticket creation: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

@router.get("/tickets", response_model=List[TicketListItem])
def get_tickets(
    search: str = Query("", description="Live search query"), 
    status_filter: str = Query("", alias="status", description="Status filter (Open, In Progress, Closed)")
):
    """
    2. GET /api/tickets
    Retrieves list of tickets. Supports status filtering and search query matching against
    customer name, email, subject, description, and ticket ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT ticket_id, customer_name, subject, status, created_at FROM tickets"
        params = []
        conditions = []
        
        if search.strip():
            search_param = f"%{search.strip()}%"
            conditions.append(
                "(customer_name LIKE ? OR customer_email LIKE ? OR subject LIKE ? OR description LIKE ? OR ticket_id LIKE ?)"
            )
            params.extend([search_param] * 5)
            
        if status_filter.strip():
            conditions.append("status = ?")
            params.append(status_filter.strip())
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
        
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )
    finally:
        if 'conn' in locals() and conn:
            conn.close()

@router.get("/tickets/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket(ticket_id: str):
    """
    3. GET /api/tickets/{ticket_id}
    Retrieves full ticket metadata and all nested internal agent comments/notes ordered by created_at ASC.
    Returns 404 if ticket not found.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch ticket
        cursor.execute(
            """
            SELECT ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at
            FROM tickets WHERE ticket_id = ?
            """,
            (ticket_id,)
        )
        ticket_row = cursor.fetchone()
        
        if not ticket_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket with ID {ticket_id} does not exist."
            )
            
        # Fetch comments/notes
        cursor.execute(
            "SELECT id, note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY created_at ASC",
            (ticket_id,)
        )
        note_rows = cursor.fetchall()
        
        notes = [
            {"id": row["id"], "note_text": row["note_text"], "created_at": row["created_at"]}
            for row in note_rows
        ]
        
        ticket_data = dict(ticket_row)
        ticket_data["notes"] = notes
        return ticket_data
        
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )
    finally:
        if 'conn' in locals() and conn:
            conn.close()

@router.put("/tickets/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket(ticket_id: str, updates: TicketUpdate):
    """
    4. PUT /api/tickets/{ticket_id}
    Modifies status and/or inserts a new activity comment. Updates the updated_at timestamp.
    Returns 404 if ticket not found.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify existence
        cursor.execute("SELECT id FROM tickets WHERE ticket_id = ?", (ticket_id,))
        ticket_row = cursor.fetchone()
        
        if not ticket_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket with ID {ticket_id} does not exist."
            )
            
        updated_at = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        
        # Update status if present in payload
        if updates.status is not None:
            cursor.execute(
                "UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?",
                (updates.status, updated_at, ticket_id)
            )
            
        # Insert activity comment if present and not empty
        if updates.note and updates.note.strip():
            cursor.execute(
                "INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)",
                (ticket_id, updates.note.strip())
            )
            
        conn.commit()
        return {"success": True, "updated_at": updated_at}
        
    except HTTPException:
        raise
    except sqlite3.Error as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failed: {str(e)}"
        )
    finally:
        if conn:
            conn.close()
