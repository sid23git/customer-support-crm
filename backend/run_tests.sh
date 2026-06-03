echo "Installing test dependencies..."
pip install -r requirements-test.txt
echo "Running tests..."
pytest test_api.py -v
