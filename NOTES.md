## Pre-requisites

- mise

```bash
brew install mise
echo 'eval "$(mise activate zsh)"' >> "${ZDOTDIR-$HOME}/.zshrc"
```

## Steps

- Clone this project:

```bash
git clone git@github.com:ruifigueira/NLWeb.git
cd NLWeb
```

- Copy `code/.env.template` to `code/.env` and set `OPENAI_API_KEY`
- Run (and pray):

```bash
mise use python@3.13
# mise ~/dev/NLWeb/mise.toml tools: python@3.13.5

python --version
# Python 3.13.5

python -m venv myenv
source myenv/bin/activate

cd code/python
pip install -r requirements.txt

python testing/check_connectivity.py

# Loaded API key 'google_maps': Not set (from GOOGLE_MAPS_API_KEY)
# Checking NLWeb configuration and connectivity...
# Using configuration from preferred LLM provider: openai
# Using configuration from preferred embedding provider: openai
# Using configuration from enabled retrieval endpoint: nlweb_west
# Using configuration from enabled retrieval endpoint: qdrant_local
# Checking LLM API connectivity for openai...
# Checking embedding API connectivity for openai...
# Checking retriever connectivity for nlweb_west...
# ❌ Retriever API connectivity check failed for nlweb_west: ValueError: No valid endpoints available for search
# Checking retriever connectivity for qdrant_local...
# ✅ Embedding API connectivity check successful for openai. Output is list of floats.
# ✅ Retriever API connectivity check successful for qdrant_local. Output is in expected format.
# ✅ LLM API connectivity check successful for openai. Output contains expected answer.

# ====== SUMMARY ======
# ✅ 3/4 connections successful
# ❌ Some connections failed. Please check error messages above.
# Time taken: 3.25 seconds

python -m data_loading.db_load https://feeds.megaphone.fm/recodedecode Decoder

# Loaded API key 'google_maps': Not set (from GOOGLE_MAPS_API_KEY)
# Fetching content from URL: https://feeds.megaphone.fm/recodedecode
# Fetching content from URL: https://feeds.megaphone.fm/recodedecode
# Saved URL content to temporary file: /var/folders/8n/0n0mv57x4357z_r5t6f7nnpw0000gn/T/tmp1z75dk8h.xml (type: rss)
# Detected file type: rss, contains embeddings: No
# Computing embeddings for file...
# Loading data from /var/folders/8n/0n0mv57x4357z_r5t6f7nnpw0000gn/T/tmp1z75dk8h.xml (resolved to /var/folders/8n/0n0mv57x4357z_r5t6f7nnpw0000gn/T/tmp1z75dk8h.xml) for site Decoder using database endpoint 'qdrant_local'
# Detected file type: rss
# Using embedding provider: openai, model: text-embedding-3-small
# Processing as RSS feed...
# Processing RSS/Atom feed: /var/folders/8n/0n0mv57x4357z_r5t6f7nnpw0000gn/T/tmp1z75dk8h.xml
# Processed 853 episodes from RSS/Atom feed
# Computing embeddings for batch of 100 texts
# Uploading batch 1 of 9 (100 documents)
# Successfully uploaded batch 1
# Processed 100/853 documents
# Computing embeddings for batch of 100 texts
# Uploading batch 2 of 9 (100 documents)
# Successfully uploaded batch 2
# Processed 200/853 documents
# Computing embeddings for batch of 100 texts
# Uploading batch 3 of 9 (100 documents)
# Successfully uploaded batch 3
# Processed 300/853 documents
# Computing embeddings for batch of 100 texts
# Uploading batch 4 of 9 (100 documents)
# Successfully uploaded batch 4
# Processed 400/853 documents
# Computing embeddings for batch of 100 texts
# Uploading batch 5 of 9 (100 documents)
# Successfully uploaded batch 5
# Processed 500/853 documents
# Computing embeddings for batch of 100 texts
# Uploading batch 6 of 9 (100 documents)
# Successfully uploaded batch 6
# Processed 600/853 documents
# Computing embeddings for batch of 100 texts
# Uploading batch 7 of 9 (100 documents)
# Successfully uploaded batch 7
# Processed 700/853 documents
# Computing embeddings for batch of 100 texts
# Uploading batch 8 of 9 (100 documents)
# Successfully uploaded batch 8
# Processed 800/853 documents
# Computing embeddings for batch of 53 texts
# Uploading batch 9 of 9 (53 documents)
# Successfully uploaded batch 9
# Processed 853/853 documents
# Loading completed. Added 853 documents to the database.
# Saved file with embeddings to ../data/json_with_embeddings/tmp1z75dk8h.xml
# Cleaned up temporary file: /var/folders/8n/0n0mv57x4357z_r5t6f7nnpw0000gn/T/tmp1z75dk8h.xml

python app-file.py
```

- Go to http://localhost:8000/
- Ask: What's up with AI?
