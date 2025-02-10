const express = require('express')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const { opendir, appendFile, readFile, open, rm } = require("node:fs/promises")
const { resolve } = require('node:path')
const app = express()
const port = 3000

app.use(express.static("public"))
app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: true }))

app.post("/file", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded")
  }

  const sampleFile = req.files.data
  console.log({ name: req.body.filename })
  const uploadPath = __dirname + '/uploads/' + req.body.filename

  sampleFile.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err)
    }

    res.send('File uploaded')
  })
})

app.get("/file", async (req, res) => {
  const workingDir = __dirname + `/uploads`
  const filename = req.query.filename
  const chunkCount = req.query.chunks
  const dir = await opendir(workingDir)

  const fileChunks = []
  for await (const dirent of dir) {
    if (dirent.name.includes(filename)) {
      fileChunks.push(dirent.name)
    }
  }
  const processedchunks = fileChunks.map(elem => {
    const elemSplit = elem.split('.')
    const index = elemSplit[elemSplit.length - 1]
    const obj = { name: elem, index }
    console.log(obj)
    return obj
  })
    .sort((a, b) => {
      return a.index - b.index
    })

  if (parseInt(chunkCount, 10) !== processedchunks.length) {
    res.status(400).send("we do not have all chunks")
  }

  await rm(`${workingDir}/${filename}`, { force: true })

  for (const chunkIndex in processedchunks) {
    const chunk = processedchunks[chunkIndex]
    const filepath = `${workingDir}/${filename}.${chunk.index}`
    const file = await open(filepath, 'r')
    const rFile = await file.readFile()
    await appendFile(`${workingDir}/${filename}`, rFile, { flush: true, flags: 'a' })
  }


  console.log(processedchunks)
  res.status(200).send()
})

app.listen(port, () => {
  console.log(`chunk upload listening on port ${port}`)
})

