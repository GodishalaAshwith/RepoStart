from pydantic import BaseModel, HttpUrl

class IngestRequest(BaseModel):
    github_url: HttpUrl

class IngestResponse(BaseModel):
    message: str
    chunks_processed: int

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    source_snippet: str
    confidence: float
