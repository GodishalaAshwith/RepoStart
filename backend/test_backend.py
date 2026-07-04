import asyncio
import httpx
import sys

async def test_backend():
    base_url = "http://localhost:8000/api"
    
    print("Testing Ingest Endpoint (waiting for server to start)...")
    
    # Retry loop to wait for uvicorn and model download
    max_retries = 20
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{base_url}/ingest",
                    json={"github_url": "https://github.com/tiangolo/fastapi"}
                )
                print(f"Status: {response.status_code}")
                print(f"Response: {response.json()}")
                
                if response.status_code != 200:
                    print("Ingest failed!")
                    sys.exit(1)
                break # Success!
        except httpx.ConnectError:
            if attempt == max_retries - 1:
                print("Failed to connect to server after multiple attempts.")
                sys.exit(1)
            print(f"Connection failed, retrying in 5 seconds... (Attempt {attempt+1}/{max_retries})")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"Error during testing: {e}")
            sys.exit(1)
            
    print("\nTesting Query Endpoint...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/query",
                json={"query": "How do I create an API router?"}
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200:
                print("\nAll tests passed successfully!")
            else:
                print("\nQuery failed!")
                
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    asyncio.run(test_backend())
