
import requests

def test_hello_endpoint():
    response = requests.get("https://beaker-l1b82pzyy-oncology-ai.vercel.app/api/hello")
    assert response.status_code == 200
