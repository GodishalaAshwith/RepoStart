from fastapi import APIRouter, HTTPException
from app.models.schemas import IngestRequest, IngestResponse, QueryRequest, QueryResponse
from app.core.github_fetcher import GithubFetcher
from app.core.embeddings import vector_store
from app.core.llm import llm_generator

router = APIRouter()
fetcher = GithubFetcher()

@router.post("/ingest", response_model=IngestResponse)
async def ingest_repo(request: IngestRequest):
    try:
        # Fetch docs from Github
        texts = await fetcher.fetch_docs(str(request.github_url))
        
        # Ingest into vector store
        chunks_processed = vector_store.ingest_texts(texts)
        
        return IngestResponse(
            message=f"Successfully ingested {chunks_processed} chunks from the repository.",
            chunks_processed=chunks_processed
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during ingestion: {str(e)}")

@router.post("/query", response_model=QueryResponse)
async def query_docs(request: QueryRequest):
    if not vector_store.chunks:
        raise HTTPException(status_code=400, detail="Index is empty. Please ingest a repository first.")
        
    try:
        results = vector_store.query(request.query, k=1)
        if not results:
            return QueryResponse(
                answer="No relevant documentation found for your query.",
                source_snippet="",
                confidence=0.0
            )
            
        best_snippet, confidence = results[0]
        
        # Here we just return the most relevant snippet directly.
        # A full LLM might synthesize an answer, but the requirement is:
        # "Return highly accurate, context-matched documentation snippets directly to the user, bypassing conversational chatbot fluff"
        
        generated_answer = llm_generator.generate_answer(request.query, best_snippet)
        
        return QueryResponse(
            answer=generated_answer,
            source_snippet=best_snippet,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during search: {str(e)}")
