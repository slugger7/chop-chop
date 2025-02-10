const form = document.querySelector("#fileUpload")

form.addEventListener("submit", async function (e) {
  e.preventDefault()

  const input = document.querySelector("#myFile")

  const file = input.files[0]

  const chunkSize = 99 * 1000 * 1000
  const chunkCount = Math.ceil(file.size / chunkSize)
  for (let i = 0; i < chunkCount; i++) {
    const chunk = file.slice(i * chunkSize, i * chunkSize + chunkSize)
    const fd = new FormData()
    fd.set('data', chunk)
    fd.set('filename', `${file.name}.${i}`)
    await fetch("http://localhost:3000/file", {
      method: "POST",
      body: fd
    })
  }

  await fetch(`http://localhost:3000/file?filename=${file.name}&chunks=${chunkCount}`, {
    method: "GET"
  })
})


const saveFile = (blob, filename) => {
  console.log("saving file", filename)
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  link.click()
}