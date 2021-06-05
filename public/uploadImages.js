//MENU ATIVO
const local = location.pathname
const links = document.querySelectorAll('header .links a')

for (let link of links) {
  if (local.includes(link.getAttribute('href'))) {
    link.classList.add('active')
  }
}

// IMAGENS RECEITAS
const PhotosUpload = {
  input: "",
  preview: document.querySelector('.chefsImagePreview'),
  uploadLimit: 1,
  files: [],

  handleFileInput(event) {
    const { files: fileList } = event.target
    PhotosUpload.input = event.target

    if (PhotosUpload.hasLimit(event)) return

    Array.from(fileList).forEach(file => {
      PhotosUpload.files.push(file)

      const reader = new FileReader()

      reader.onload = () => {
        const image = new Image() // img
        image.src = String(reader.result)

        const container = PhotosUpload.getContainer(image)
        PhotosUpload.preview.appendChild(container)
      }
      reader.readAsDataURL(file)
    })

    PhotosUpload.input.files = PhotosUpload.getAllFiles()

  },
  hasLimit(event) {
    const { uploadLimit, preview } = PhotosUpload
    const { files: fileList } = event.target

    if (fileList.length > uploadLimit) {
      alert(`ENVIE NO MÁXIMO ${uploadLimit} FOTOS`)
      event.preventDefault()
      return true
    }

    const photosDiv = []
    preview.childNodes.forEach(item => {
      if (item.classList && item.classList.value == "photo")
        photosDiv.push(item)
    })
    const totalPhotos = fileList.length + photosDiv.length
    if (totalPhotos > uploadLimit) {
      alert('Você atingiu o limite máximo de fotos.')
      event.preventDefault()
      return true
    }

    return false
  },
  getAllFiles() {
    const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

    PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

    return dataTransfer.files

  },
  getContainer(image) {
    const container = document.createElement('div')
    container.classList.add('photo')

    container.onclick = PhotosUpload.removePhoto
    container.appendChild(image)
    container.appendChild(PhotosUpload.getRemoveButton())

    return container
  },
  getRemoveButton() {
    const button = document.createElement('i')
    button.classList.add('material-icons')
    button.innerHTML = 'close'

    return button
  },
  removePhoto(event) {
    const photoDiv = event.target.parentNode //<div class="photo"
    const photosArray = Array.from(PhotosUpload.preview.children)
    const index = photosArray.indexOf(photoDiv)

    PhotosUpload.files.splice(index, 1)
    PhotosUpload.input.files = PhotosUpload.getAllFiles()

    photoDiv.remove()
  },
  removeOldPhoto(event) {
    const photoDiv = event.target.parentNode

    if (photoDiv.id) {
      const removedFiles = document.querySelector('input[name="removed_file"]')
      if (removedFiles) {
        removedFiles.value += `${photoDiv.id},`
      }
    }

    photoDiv.remove()
  }
}

const ImageGallery = {
  highlight: document.querySelector('.gallery .highlight > img'),
  previews: document.querySelectorAll('.gallery-preview img'),
  setImage(event) {
    const { target } = event

    ImageGallery.previews.forEach(preview => preview.classList.remove('active-image'))

    target.classList.add('active-image')

    ImageGallery.highlight.src = target.src
  }
}