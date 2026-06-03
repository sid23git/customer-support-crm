from pydantic import BaseModel, Field
from typing import List, Optional

class TicketCreate(BaseModel):
    """
    Schema for validating ticket creation request payload.
    """
    customer_name: str = Field(..., min_length=1, description="Customer's full name")
    customer_email: str = Field(..., min_length=1, description="Customer's email address")
    subject: str = Field(..., min_length=1, description="Subject of the support ticket")
    description: str = Field(..., min_length=1, description="Detailed description of the issue")

class TicketCreateResponse(BaseModel):
    """
    Response schema for a successfully created ticket.
    """
    ticket_id: str
    created_at: str

class TicketListItem(BaseModel):
    """
    Individual ticket entry returned in lists.
    """
    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: str

class NoteResponse(BaseModel):
    """
    Schema for internal agent comments/notes.
    """
    id: int
    note_text: str
    created_at: str

class TicketDetailResponse(BaseModel):
    """
    Detailed ticket details response containing nested activity notes list.
    """
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: str
    updated_at: str
    notes: List[NoteResponse]

class TicketUpdate(BaseModel):
    """
    Schema for incoming status updates or comments.
    """
    status: Optional[str] = Field(default=None, description="New ticket status")
    note: Optional[str] = Field(default=None, description="Optional agent comment/note to append")

class TicketUpdateResponse(BaseModel):
    """
    Response schema after successfully updating ticket properties.
    """
    success: bool
    updated_at: str
