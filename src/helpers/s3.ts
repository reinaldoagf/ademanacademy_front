import { getPresignedUrlAction } from "@/app/actions/s3";
// 🎯 Manejo del Envío del Formulario
export const uploadFileToS3 = async (file: File): Promise<{ url: string; key: string }> => {
    const presignedRes = await getPresignedUrlAction(file.type);
    if (!presignedRes.success) throw new Error(presignedRes.error);

    const { uploadUrl, fileUrl, key } = presignedRes.data;

    // Carga binaria limpia vía HTTP PUT directo
    const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!uploadResponse.ok) throw new Error("Error al subir archivo a S3");

    return { url: fileUrl, key };
};