import type { ProjectFileMeta } from '../types'
import type { ProjectProfile } from '../types/analysis'
import {
  createProjectProfile,
  createProjectProfileFromText,
} from './projectProfile'

export type ProfileReadResult = {
  profile: ProjectProfile
  textRead: boolean
}

/**
 * Reads selectable PDF text locally in the browser. It does not use OCR,
 * upload the document, or call an external service.
 */
export async function readProjectProfile(
  fileMeta: ProjectFileMeta,
): Promise<ProfileReadResult> {
  const fallback = createProjectProfile(fileMeta)
  try {
    const [{ GlobalWorkerOptions, getDocument }, workerModule] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ])
    GlobalWorkerOptions.workerSrc = workerModule.default
    const data = new Uint8Array(await fileMeta.file.arrayBuffer())
    const document = await getDocument({ data }).promise
    const pages: string[] = []
    const pageLimit = Math.min(document.numPages, 25)

    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ')
      if (text) pages.push(text)
    }

    const combined = pages.join('\n')
    if (combined.trim().length < 40) {
      return {
        profile: {
          ...fallback,
          extractionNotes: [
            ...fallback.extractionNotes,
            'No usable selectable text was found; the PDF may be scanned or image-only.',
          ],
        },
        textRead: false,
      }
    }

    return {
      profile: createProjectProfileFromText(fileMeta, combined),
      textRead: true,
    }
  } catch {
    return {
      profile: {
        ...fallback,
        extractionNotes: [
          ...fallback.extractionNotes,
          'PDF text reading failed safely; deterministic simulation fallback retained.',
        ],
      },
      textRead: false,
    }
  }
}
