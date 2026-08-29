export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_BATCH_SIZE = 10;

export const fileId = (file) => `${file.name}-${file.size}-${file.lastModified}`;

export function validateFiles(newFiles, existingFiles = []) {
  const errors = [];
  const valid = [];
  const existingIds = new Set(existingFiles.map((f) => f.id || fileId(f.file || f)));

  for (const file of newFiles) {
    const id = fileId(file);
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`"${file.name}" has an unsupported format. Use JPG, PNG, or WEBP.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB file limit.`);
      continue;
    }
    if (existingIds.has(id)) {
      // Avoid duplicate silently or skip
      continue;
    }
    existingIds.add(id);
    valid.push(file);
  }

  const totalAfterAdd = existingFiles.length + valid.length;
  if (totalAfterAdd > MAX_BATCH_SIZE) {
    const allowedCount = Math.max(0, MAX_BATCH_SIZE - existingFiles.length);
    if (allowedCount === 0) {
      errors.push(`Maximum batch limit of ${MAX_BATCH_SIZE} images reached.`);
      return { valid: [], errors };
    }
    errors.push(`Only ${allowedCount} more image${allowedCount !== 1 ? "s" : ""} can be added (maximum ${MAX_BATCH_SIZE} per batch).`);
    return { valid: valid.slice(0, allowedCount), errors };
  }

  return { valid, errors };
}

