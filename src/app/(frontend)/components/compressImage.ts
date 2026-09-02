// This Cloudinary account rejects uploads over ~1 MiB (confirmed while bulk-importing
// memories server-side — see scripts/import-photos.ts). Phone photos from a public
// upload button are routinely 3-8MB, so shrink client-side before ever hitting the
// network: resize to a max dimension, then step quality down until it fits.
const MAX_BYTES = 950_000
const MAX_DIMENSION = 1800

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

/** Resizes + compresses an image file down to a Cloudinary-safe JPEG File. */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  let quality = 0.85
  let blob = await canvasToBlob(canvas, quality)

  while (blob && blob.size > MAX_BYTES && quality > 0.4) {
    quality -= 0.15
    blob = await canvasToBlob(canvas, quality)
  }

  if (!blob) return file

  const name = file.name.replace(/\.\w+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}
