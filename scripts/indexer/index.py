import os
from dotenv import load_dotenv
import typesense
import json
from datetime import datetime

load_dotenv()

BATCH_SIZE = int(os.getenv('BATCH_SIZE', 5000))
JSONL_DATA_FILE = os.getenv('JSONL_DATA_FILE', './scripts/data/transformed_dataset.json')

print(f"Looking for data file at: {os.path.abspath(JSONL_DATA_FILE)}")

if not os.path.exists(JSONL_DATA_FILE):
    print(f"ERROR: Data file not found at {JSONL_DATA_FILE}")
    exit(1)

client = typesense.Client({
    'api_key': os.getenv('TYPESENSE_ADMIN_API_KEY'),
    'nodes': [{
        'host': os.getenv('TYPESENSE_HOST'),
        'port': os.getenv('TYPESENSE_PORT'),
        'protocol': os.getenv('TYPESENSE_PROTOCOL')
    }],
    'connection_timeout_seconds': 100
})

COLLECTION_NAME = "writeups"

schema = {
    'name': COLLECTION_NAME,
    'fields': [
        {
            'name': 'title',
            'type': 'string'
        },
        {
            'name': 'author',
            'type': 'string',
            'facet': True
        },
        {
            'name': 'date',
            'type': 'string',
            'facet': True,
            'sort': True
        },
        {
            'name': 'content',
            'type': 'string'
        },
        {
            'name': 'url',
            'type': 'string'
        },
        {
            'name': 'mirror_url',
            'type': 'string'
        }
    ]
}

print(f"Attempting to delete existing collection: {COLLECTION_NAME}")
try:
    client.collections[COLLECTION_NAME].delete()
    print("Existing collection deleted")
except Exception as e:
    print(f"Collection not found or could not be deleted: {e}")

print(f"Creating new collection in Typesense: {COLLECTION_NAME}")
client.collections.create(schema)

print("Indexing documents...")
try:
    with open(JSONL_DATA_FILE, 'r', encoding='utf-8') as f:
        print(f"File content length: {os.path.getsize(JSONL_DATA_FILE)} bytes")
        documents = json.load(f)
        
        if not isinstance(documents, list):
            print("ERROR: JSON file should contain an array of documents")
            exit(1)
            
        # Import in batches
        for i in range(0, len(documents), BATCH_SIZE):
            batch = documents[i:i + BATCH_SIZE]
            try:
                client.collections[COLLECTION_NAME].documents.import_(batch)
                print(f"Indexed {len(batch)} documents")
            except Exception as e:
                print(f"Error indexing batch: {e}")
                continue

        print(f"\nSuccessfully imported {len(documents)} documents")

except json.JSONDecodeError as e:
    print(f"ERROR: Invalid JSON in data file: {e}")
    exit(1)
except Exception as e:
    print(f"ERROR: Failed to process data file: {e}")
    exit(1)

if os.getenv('UPDATE_COLLECTION_ALIAS') == 'true':
    alias_name = os.getenv('TYPESENSE_COLLECTION_NAME')
    
    try:
        old_collection = client.aliases[alias_name].retrieve()['collection_name']
        print(f"Found existing alias pointing to: {old_collection}")
    except:
        old_collection = None
        
    print(f"Updating alias {alias_name} -> {COLLECTION_NAME}")
    client.aliases.upsert(alias_name, {'collection_name': COLLECTION_NAME})
    
    if old_collection:
        print(f"Deleting old collection: {old_collection}")
        client.collections[old_collection].delete()
