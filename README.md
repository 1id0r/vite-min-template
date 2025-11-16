# Mantine Vite template

Get started with the template by clicking `Use this template` button on the top of the page.

[Documentation](https://mantine.dev/guides/vite/)

## FastAPI service (Python backend)

To run the mock backend locally on another machine:

1. Open a terminal and move into the backend folder:
   ```bash
   cd fastapi_service
   ```
2. Create a virtual environment (once per machine):
   ```bash
   python3 -m venv .venv
   ```
3. Activate the environment:
   - **macOS/Linux**
     ```bash
     source .venv/bin/activate
     ```
   - **Windows (PowerShell)**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the API:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

Keep the server running while developing the React app so the frontend can call the mock endpoints.
