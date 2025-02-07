# 🔍 CTF Writeups Search

A fast and efficient search engine for CTF (Capture The Flag) writeups and solutions, powered by Typesense. Search through a curated collection of 25,000+ CTF writeups with instant results and smart filtering.

View it live here: [https://ctfsearch.hackmap.win](https://ctfsearch.hackmap.win)

## Features

- 🚀 Instant search with typo tolerance
- 🏷️ Smart category filtering
- 📱 Mobile-friendly interface
- 🌓 Dark/Light theme support
- ⚡ Fast and responsive UI

## Tech Stack

This search experience is powered by [Typesense](https://typesense.org), an open-source, typo-tolerant search engine. It's designed as a faster alternative to Elasticsearch and an open-source alternative to Algolia.

The frontend is built with:
- [InstantSearch.js](https://github.com/algolia/instantsearch.js)
- [Typesense Instantsearch Adapter](https://github.com/typesense/typesense-instantsearch-adapter)
- Bootstrap 4
- Parcel bundler

The search backend runs on Typesense, which can be self-hosted or used via [Typesense Cloud](https://cloud.typesense.org).

## Project Structure

- `src/` - Frontend components and styles
- `scripts/indexer/` - Python scripts for data indexing
- `scripts/data/` - Sample dataset and transformation scripts

## Development

To run this project locally:

1. Install dependencies:
```shell
yarn
```

2. Start Typesense server (requires Docker):
```shell
yarn run typesenseServer
```

3. Set up environment:
```shell
cp .env.example .env
```

4. Index the data:
```shell
yarn run indexer:transformWriteups
yarn run indexer:importToTypesense
```

Data must be in the `scripts/data/writeups.json` file. In this format:

```json
{
  "documents": [
    {
      "title": "Writeup Title",
      "url": "https://example.com/writeup",
      "author": "Author Name",
      "mirror_url": "https://example2.com/writeup",
      "date": "2024-01-01",
      "base64_content": "base64_encoded_content"
    }
  ]
}
```

5. Start development server:
```shell
yarn start
```

Open http://localhost:3000 to see the app.

## Environment Variables

Create a `.env` file with the following variables:

```env
TYPESENSE_API_KEY=xyz
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_SEARCH_ONLY_API_KEY=xyz
```

## Deployment

The app is designed to be hosted on AWS S3 with CloudFront as CDN:

```shell
yarn build
yarn deploy
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this code for your own projects.

## References

- [Based on Typesense showcase-books-search](https://github.com/typesense/showcase-books-search)
