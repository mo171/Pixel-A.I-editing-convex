import ImageKit from "imagekit";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const imageKit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
})

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const fileName = formData.get("fileName");

        if (!file || !fileName) {
            return NextResponse.json({ error: "File and fileName are required" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Math.floor(Date.now() / 1000);
        const santinzedFileName = fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") || `upload`;
        const uniqueFiuleName = `${userId}/${timestamp}_${santinzedFileName}`;

        const uploadResponse = await imageKit.upload({
            file: buffer,
            fileName: uniqueFiuleName,
            folder: "SaaS-Image-Uploads",
        });

        const thumbnailUrl = imageKit.url({
            src: uploadResponse.url,
            transformation: [
                {
                    width: 400,
                    height: 300,
                    cropMode: "maintain_ar",
                    quality: 80,
                },
            ],
        });

        return NextResponse.json({
            success: true,
            url : uploadResponse.url,
            thumbnailUrl: thumbnailUrl,
            fileId: uploadResponse.fileId,
            width: uploadResponse.width,
            height: uploadResponse.height,
            size: uploadResponse.size,
            name: uploadResponse.name,
        });

    } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json({ 
            success: false,
            error: "Image upload failed. Please try again later.",      
            details: error.message,
        }, { status: 500 });
        
    }
}