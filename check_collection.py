import typesense

client = typesense.Client({
    "api_key": "xyz",
    "nodes": [{"host": "localhost", "port": "8108", "protocol": "http"}],
    "connection_timeout_seconds": 2
})

print("\nAll Collections:")
collections = client.collections.retrieve()
print(collections)

print("\nWriteups Collection:")
collection = client.collections["writeups"].retrieve()
print(collection)

print("\nSearch Results:")
results = client.collections["writeups"].documents.search({
    "q": "*",
    "query_by": "content"
})
print(f"Total documents: {results['found']}") 