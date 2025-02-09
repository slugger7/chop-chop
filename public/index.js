const form = document.querySelector("#fileUpload")

form.addEventListener("submit", async function (e) {
  e.preventDefault()

  const input = document.querySelector("#myFile")

  const file = input.files[0]

  const reader = new FileReader()

  reader.onload = async () => {
    const chunkSize = 1000
    const content = reader.result

    console.log("Data size:", content.byteLength)
    const totalChunks = Math.ceil(content.byteLength / chunkSize)
    for (let i = 0; i < totalChunks; i++) {
      console.log("Processing chunk", i * chunkSize)
      const chunk = new Blob([content.slice(i * chunkSize, (i + 1) * chunkSize)])
      const fileChunk = new File([chunk], `${file.name}${i + 1}.${totalChunks}`)

      const data = new FormData()
      data.append("file", fileChunk)
      await fetch("http://localhost:3000/file", {
        method: "POST",
        body: data
      })
    }
    console.log("Done reading chunks")

    await fetch(`http://localhost:3000/file?filename=${file.name}`, {
      method: "GET"
    })
  }
  reader.onerror = () => {
    console.error("error reading file")
  }
  reader.readAsArrayBuffer(file)


})

const saveFile = (blob, filename) => {
  console.log("saving file", filename)
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  link.click()
}