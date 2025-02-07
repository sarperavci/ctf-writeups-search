import os
from dotenv import load_dotenv
import json
import base64

load_dotenv()

INPUT_FILE = os.getenv('INPUT_FILE', './scripts/data/writeups.json')
OUTPUT_FILE = os.getenv('OUTPUT_FILE', './scripts/data/transformed_dataset.json')

print(f"Reading from: {os.path.abspath(INPUT_FILE)}")
print(f"Writing to: {os.path.abspath(OUTPUT_FILE)}")

if not os.path.exists(INPUT_FILE):
    print(f"ERROR: Input file not found at {INPUT_FILE}")
    exit(1)

print('Processing writeups...')

try:
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        print(f"Input file size: {len(content)} bytes")
        
        if len(content.strip()) == 0:
            print("ERROR: Input file is empty!")
            exit(1)
            
        writeups = json.loads(content)["documents"]
        print(f"Found {len(writeups)} writeups to process")

        transformed_writeups = []
        for i, writeup in enumerate(writeups, 1):
            try:
                if len(writeup.get('author', '').strip()) < 3:
                    writeup["author"] =""
                if 'content_base64' in writeup:
                    content = base64.b64decode(writeup['content_base64']).decode('utf-8')
                else:
                    content = base64.b64decode(writeup['base64_content']).decode('utf-8')
                transformed = {
                    'title': writeup['title'],
                    'author': writeup.get('author', 'Unknown'),
                    'date': writeup.get('date', 'Unknown'),
                    'content': content,
                    'url': writeup.get('url', ''),
                    'mirror_url': writeup.get('mirror_url', '')
                }
                transformed_writeups.append(transformed)
                print(f"Transformed writeup {i}: {transformed['title']}")
            except Exception as e:
                print(f"Error transforming writeup {i}: {e}")
                print(f"Writeup data: {writeup}")

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(transformed_writeups, f, indent=2, ensure_ascii=False)
            print(f"\nSuccessfully wrote {len(transformed_writeups)} transformed writeups to {OUTPUT_FILE}")

except Exception as e:
    print(f"Error processing file: {e}")
    exit(1)
