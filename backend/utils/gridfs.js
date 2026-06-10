/* ============================================
   ProForm — Stockage de fichiers via MongoDB GridFS
   (persiste même après redéploiement sur Render)
   ============================================ */

const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

const BUCKET_NAME = 'uploads';

function getBucket() {
  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
}

/* Upload un buffer dans GridFS, retourne l'ID du fichier (string) */
function uploadBuffer(buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(filename, { contentType });
    stream.end(buffer);
    stream.on('finish', () => resolve(stream.id.toString()));
    stream.on('error', reject);
  });
}

/* Extrait l'ID GridFS d'un chemin '/api/files/<id>' */
function extractFileId(filePath) {
  if (!filePath) return null;
  const m = filePath.match(/\/api\/files\/([a-f0-9]{24})/);
  return m ? m[1] : null;
}

/* Supprime un fichier GridFS à partir de son chemin '/api/files/<id>' (ignore si absent) */
async function deleteFileByPath(filePath) {
  const id = extractFileId(filePath);
  if (!id) return;
  try {
    await getBucket().delete(new ObjectId(id));
  } catch (e) {
    /* fichier déjà supprimé ou introuvable — ignorer */
  }
}

module.exports = { getBucket, uploadBuffer, extractFileId, deleteFileByPath };
