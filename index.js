const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const { opendir, readFile, appendFile } = require("node:fs/promises")
const { resolve } = require("node:path")
const app = express()
const port = 3000

app.use(cors())
app.use(express.static("public"))
app.use(fileUpload())

app.post("/file", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded")
  }

  const sampleFile = req.files.file
  const uploadPath = __dirname + '/uploads/' + sampleFile.name

  sampleFile.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err)
    }

    res.send('File uploaded')
  })
})

app.get("/file", async (req, res) => {
  const filename = req.query.filename
  const dir = await opendir(__dirname + `/uploads`)

  const fileChunks = []
  for await (const dirent of dir) {
    if (dirent.name.includes(filename)) {
      fileChunks.push(dirent.name)
    }
  }
  const processedchunks = fileChunks.map(elem => {
    const elemSplit = elem.split('.')
    const total = elemSplit[elemSplit.length - 1]
    const index = elemSplit[elemSplit.length - 2]
    return { name: elem, originalName: elemSplit.slice(0, -2).join("."), index, total }
  })
    .sort((a, b) => {
      return a.index - b.index
    })

  if (parseInt(processedchunks[0].total, 10) !== processedchunks.length) {
    res.status(400).send("we do not have all chunks")
  }

  await Promise.all(processedchunks.map(async (c) => {
    const filePath = resolve(`./uploads/${c.originalName}.${c.index}.${c.total}`)
    const contents = await readFile(filePath)
    await appendFile(resolve(`./uploads/${c.originalName}`), contents)
  }))

  console.log(processedchunks)
  res.status(200).send()
})

app.listen(port, () => {
  console.log(`chunk upload listening on port ${port}`)
})

