import typesense


client = typesense.Client({
    "api_key": "xyz",
    "nodes": [{"host": "localhost", "port": "8108", "protocol": "http"}],
    "connection_timeout_seconds": 2
})


key = client.keys.create({
  "description": "Read only key.",
  "actions": ["documents:search"],
  "collections": ["writeups","database_stats"]
})

print(key)