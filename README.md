# Chunk Chunk

This is a POC to get chunk file upload working.

DISCLAIMER: this should not be done unless absolutely necessary.

My use case for this is to create applications that can be hosted through cloud flare tunnels.

Cloudflare tunnels restricts file uploads larger than 100mb in size. This makes it very difficult to host something like [immich](https://immich.app/).

## Running the application

- `npm i`
- `npm start`
- [app](http://localhost:3000)
- upload a file greater than 100mb

## Endpoints

### POST /file

This enpoint is just to grab all the chunks one by one and save them to the [uploads](./uploads) folder.

### GET /file?filename=<filename>&chunks=<chunkCount>

This endpoint should be called when all chunks have been uploaded using the post method.

We need the file name and the amount of chunks to confirm we have everything we need.

It will then reconstruct the file on the server.

## Improvements and suggestions

While this approach works this is only a proof of concept.

If I were to implement something like this in production I would recommend the following

- When POSTing the chunks the first response should contain a UUID that can then be attached to the post to save all the chunks in a specific UUID folder to avoid conflicts when multiple files are being uploaded.
- Generate a md5sum of the original file before chunking it to confirm that it is correctly constructed on the other side
- An md5sum could be generated of each chunk as well and verified. This is extra resilience but will impact performance
