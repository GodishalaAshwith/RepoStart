import httpx
import re
from urllib.parse import urlparse

class GithubFetcher:
    def __init__(self):
        # We will try to fetch these standard documentation files.
        self.target_files = ["README.md", "CONTRIBUTING.md", "docs/README.md"]
    
    def _parse_repo_url(self, url: str) -> tuple[str, str]:
        """Parses a github URL to extract owner and repo name."""
        parsed = urlparse(url)
        path_parts = parsed.path.strip("/").split("/")
        
        if len(path_parts) >= 2:
            owner = path_parts[0]
            repo = path_parts[1]
            # Remove .git if present
            if repo.endswith(".git"):
                repo = repo[:-4]
            return owner, repo
        raise ValueError("Invalid GitHub URL format. Expected https://github.com/owner/repo")

    async def fetch_docs(self, url: str) -> list[str]:
        """Fetches documentation files from the provided GitHub URL."""
        owner, repo = self._parse_repo_url(url)
        
        fetched_texts = []
        
        async with httpx.AsyncClient() as client:
            # We try fetching from the 'main' and 'master' branches
            branches = ["main", "master"]
            
            for file_path in self.target_files:
                file_fetched = False
                for branch in branches:
                    if file_fetched:
                        break
                    
                    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{file_path}"
                    try:
                        response = await client.get(raw_url)
                        if response.status_code == 200:
                            # Prepend the filename so the chunking knows where it came from
                            text = f"# File: {file_path}\n\n{response.text}"
                            fetched_texts.append(text)
                            file_fetched = True
                    except Exception as e:
                        print(f"Error fetching {raw_url}: {e}")
                        
        if not fetched_texts:
            raise ValueError(f"Could not find any standard documentation (README.md, etc.) in {owner}/{repo}")
            
        return fetched_texts
