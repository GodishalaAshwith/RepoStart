from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import re

class VectorStore:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.dimension = None
        self.index = None
        self.chunks = []
        
    def _lazy_init(self):
        if self.model is None:
            print(f"Initializing embedding model {self.model_name}...")
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_embedding_dimension()
            self.index = faiss.IndexFlatL2(self.dimension)
            print("Embedding model initialized successfully.")
        
    def _chunk_text(self, text: str, max_words: int = 150, overlap: int = 30) -> list[str]:
        """Markdown-aware chunking with word-overlap fallback for large sections."""
        # Split by Markdown headers (e.g., #, ##, ###) at the start of a line
        sections = re.split(r'\n(?=#+ )', text)
        
        chunks = []
        for section in sections:
            section = section.strip()
            if not section:
                continue
                
            words = section.split()
            # If the section is small enough, keep it as one cohesive chunk
            if len(words) <= max_words:
                chunks.append(section)
            else:
                # Fallback to word-level overlap chunking for huge sections
                step = max_words - overlap
                if step <= 0:
                    step = max_words
                for i in range(0, len(words), step):
                    chunk = " ".join(words[i:i + max_words])
                    chunks.append(chunk)
                    
        return chunks

    def ingest_texts(self, texts: list[str]) -> int:
        """Chunks texts, creates embeddings, and adds them to the FAISS index."""
        self._lazy_init()
        all_chunks = []
        for text in texts:
            all_chunks.extend(self._chunk_text(text))
            
        if not all_chunks:
            return 0
            
        # Compute embeddings
        embeddings = self.model.encode(all_chunks, convert_to_numpy=True)
        
        # Add to FAISS index
        self.index.add(embeddings)
        self.chunks.extend(all_chunks)
        
        return len(all_chunks)
        
    def query(self, query_text: str, k: int = 3) -> list[tuple[str, float]]:
        """Searches the index for the top k most similar chunks to the query."""
        self._lazy_init()
        if not self.chunks:
            return []
            
        # Encode the query
        query_embedding = self.model.encode([query_text], convert_to_numpy=True)
        
        # Search the index
        distances, indices = self.index.search(query_embedding, k)
        
        results = []
        for j, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.chunks):
                # We can convert distance to a pseudo-confidence score (lower distance is better)
                # For L2 distance, a common conversion to similarity is 1 / (1 + distance)
                confidence = 1.0 / (1.0 + float(distances[0][j]))
                results.append((self.chunks[idx], confidence))
                
        return results

# Singleton instance to be used across the app
vector_store = VectorStore()
